import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Web } from '../entities/Web';
import { AnchorScanner } from '../entities/AnchorScanner';
import {
  AIM_ASSIST_BASE_DEGREES,
  AIM_ASSIST_BEACON_BONUS,
  CAMERA_SCROLL_ACCEL,
  CAMERA_SCROLL_SPEED_MAX,
  CAMERA_SCROLL_SPEED_START,
  CAMERA_VERTICAL_OFFSET,
  GAME_HEIGHT,
  GAME_WIDTH,
  PIXELS_PER_METER,
  PLAYER_COYOTE_TIME,
  PLAYER_GRAVITY,
  PLAYER_JUMP_BUFFER,
  SLOWMO_SCALE,
  WEB_MIN_LENGTH,
  WEB_MAX_LENGTH,
  aimAssistConeForDifficulty,
  difficultyForDistance,
  scrollSpeedCapForDifficulty,
} from '../config/constants';
import { SettingsStore } from '../systems/SettingsStore';
import { segmentPool } from '../config/segments';
import { SegmentGenerator, GeneratedSegment, PickupType } from '../systems/SegmentGenerator';
import { AnchorManager } from '../systems/AnchorManager';
import { PlatformManager } from '../systems/PlatformManager';
import { HazardManager } from '../systems/HazardManager';
import { PickupManager } from '../systems/PickupManager';
import { CollisionManager } from '../systems/CollisionManager';
import { Pickup } from '../entities/Pickup';
import { ScoreManager } from '../systems/ScoreManager';
import { HUDOverlay } from '../ui/HUDOverlay';

const WEB_COLORS = {
  none: 0x7a8296,
  surface: 0x70f3ff,
  beacon: 0xff86ff,
};

const CURSOR_TEXTURES = {
  idle: 'cursor-idle',
  surface: 'cursor-surface',
  beacon: 'cursor-beacon',
};

interface AttachResult {
  point: Phaser.Math.Vector2;
  type: 'surface' | 'beacon';
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private web!: Web;
  private anchorScanner!: AnchorScanner;
  private settings!: SettingsStore;
  private hud!: HUDOverlay;

  private cursorPointer!: Phaser.Input.Pointer;
  private scrollSpeed = CAMERA_SCROLL_SPEED_START;
  private guideColor = WEB_COLORS.none;
  private reelInput = 0;
  private reelInputResetTimer?: Phaser.Time.TimerEvent;
  private currentCursorState: keyof typeof CURSOR_TEXTURES = 'idle';
  private friendlyAnchors: Phaser.Math.Vector2[] = [];

  private distanceTravelled = 0;
  private elapsedTime = 0;
  private seenHazards = new Set<string>();
  private lastTetheredState = false;
  private runEnded = false;
  private currentDifficulty = 1;
  private aimAssistBonus = 0;
  private lastGroundedForScore = false;
  private pickupsCollected = 0;
  private closestNearMiss = Number.POSITIVE_INFINITY;

  private segmentGenerator!: SegmentGenerator;
  private anchorManager!: AnchorManager;
  private platformManager!: PlatformManager;
  private hazardManager!: HazardManager;
  private pickupManager!: PickupManager;
  private collisionManager!: CollisionManager;
  private activeSegments: GeneratedSegment[] = [];
  private readonly scoreManager = new ScoreManager();
  private activeEffects = new Map<PickupType, number>();
  private pickupDisplay?: { type: PickupType; expiresAt: number; duration: number };
  private nearMissCooldown = new WeakMap<Phaser.GameObjects.GameObject, number>();

  constructor() {
    super('GameScene');
  }

  preload(): void {
    if (!this.textures.exists('runner')) {
      const width = 32;
      const height = 48;
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });

      // Body
      gfx.fillStyle(0x3b82f6, 1);
      gfx.fillRect(11, 8, 10, 24);

      // Head
      gfx.fillStyle(0xfbbf24, 1);
      gfx.fillCircle(16, 6, 5);

      // Legs
      gfx.fillStyle(0x1e40af, 1);
      gfx.fillRect(12, 32, 4, 12);
      gfx.fillRect(16, 32, 4, 12);

      // Arms
      gfx.fillRect(8, 12, 3, 10);
      gfx.fillRect(21, 12, 3, 10);

      gfx.generateTexture('runner', width, height);
      gfx.destroy();
    }
  }

  create(): void {
    this.settings = new SettingsStore();

    this.createWorldBounds();
    this.setupInput();
    this.createPlayer();
    this.createWeb();
    this.createWorldManagers();
    this.hud = new HUDOverlay({ scene: this });
    this.hud.setPickup('None');
    this.hud.setPickupProgress(0);
    this.scoreManager.reset();
    this.activeEffects.clear();
    this.pickupDisplay = undefined;
    this.pickupsCollected = 0;
    this.closestNearMiss = Number.POSITIVE_INFINITY;
    this.nearMissCooldown = new WeakMap();
    this.collisionManager = new CollisionManager({
      scene: this,
      player: this.player,
      web: this.web,
      platformManager: this.platformManager,
      hazardManager: this.hazardManager,
      pickupManager: this.pickupManager,
      onPlayerHitHazard: (hazardType) => this.handleHazardCollision(hazardType),
      onPickupCollected: (pickup) => this.handlePickupCollected(pickup),
    });
    this.refreshPickupState();
    this.spawnInitialSegments();
    this.hud.setSeed(this.segmentGenerator.seed);
    this.cameras.main.startFollow(
      this.player.sprite,
      true,
      0.1,
      0.1,
      -GAME_WIDTH * 0.3,
      CAMERA_VERTICAL_OFFSET,
    );
    this.setupCursorSprite('idle');

    this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
    this.input.keyboard.on('keydown-P', () => this.pauseGame());
  }

  update(time: number, delta: number): void {
    this.updateScrollSpeed(delta);
    this.updateCamera(delta);
    this.updateDistance(delta);
    this.updateWebAim();
    this.web.setReelInput(this.reelInput);
    this.syncPlayerWebState();
    this.updateSegments();
    this.hazardManager.update(time, delta);
    this.collisionManager.update();
    this.updatePickupEffects();
    this.updateGroundedScoreState();
    this.checkNearMisses();
    this.updateHudFromScore();
  }

  private createWorldBounds(): void {
    this.physics.world.setBounds(0, -GAME_HEIGHT * 0.5, GAME_WIDTH * 12, GAME_HEIGHT * 1.5);
  }

  private setupInput(): void {
    this.cursorPointer = this.input.activePointer;

    this.input.on('pointerdown', () => {
      const target = this.tryAttachWeb();
      if (target) {
        this.web.attachTo(target.point);
        this.scoreManager.registerSwing(true);
        if (target.type === 'beacon') {
          this.scoreManager.registerBeaconUse();
        }
        this.setupCursorSprite(target.type === 'beacon' ? 'beacon' : 'surface');
      } else {
        this.scoreManager.registerSwing(false);
      }
    });

    this.input.on('pointerup', () => {
      if (this.web.isTethered) {
        this.web.detach('manual');
      }
      this.setupCursorSprite('idle');
    });

    this.input.keyboard.on('keydown-Q', () => {
      this.reelInput = -1;
    });
    this.input.keyboard.on('keyup-Q', () => {
      if (this.reelInput === -1) this.reelInput = 0;
    });

    this.input.keyboard.on('keydown-E', () => {
      this.reelInput = 1;
    });
    this.input.keyboard.on('keyup-E', () => {
      if (this.reelInput === 1) this.reelInput = 0;
    });

    this.input.keyboard.on('keydown-S', () => {
      this.web.detach('manual');
      this.setupCursorSprite('idle');
    });

    this.input.on('wheel', (_pointer, _over, _dx, dy) => {
      const direction = Math.sign(dy);
      if (direction === 0) return;
      this.reelInput = direction;
      this.scheduleReelReset();
    });
  }

  private createPlayer(): void {
    this.player = new Player({
      scene: this,
      x: GAME_WIDTH * 0.2,
      y: GAME_HEIGHT * 0.6,
      coyoteTimeMs: this.settings.value.assists.coyoteTimeMs ?? PLAYER_COYOTE_TIME,
      jumpBufferMs: this.settings.value.assists.jumpBufferMs ?? PLAYER_JUMP_BUFFER,
    });

    this.player.setGravity(PLAYER_GRAVITY);
  }

  private createWeb(): void {
    this.web = new Web({
      scene: this,
      player: this.player.sprite,
      solids: [],
    });
  }

  private createWorldManagers(): void {
    this.segmentGenerator = new SegmentGenerator({ scene: this, segments: segmentPool });
    this.anchorManager = new AnchorManager({ scene: this, debug: false });
    this.platformManager = new PlatformManager({ scene: this });
    this.hazardManager = new HazardManager({ scene: this });
    this.pickupManager = new PickupManager({ scene: this });
  }

  private spawnInitialSegments(): void {
    this.segmentGenerator.reset();
    this.platformManager.clear();
    this.hazardManager.clear();
    this.pickupManager.clear();
    this.activeSegments = [];

    const generatedSegments: GeneratedSegment[] = [];
    for (let i = 0; i < 3; i += 1) {
      const segment = this.spawnNextSegment(i + 1);
      generatedSegments.push(segment);
    }

    const { surfacePoints, beaconZones } = this.anchorManager.appendSegments(generatedSegments);
    this.anchorScanner = new AnchorScanner({
      scene: this,
      surfaceAnchors: surfacePoints,
      beaconZones,
    });
    this.friendlyAnchors = surfacePoints;
  }

  private spawnNextSegment(difficulty: number): GeneratedSegment {
    const segment = this.segmentGenerator.nextSegment(difficulty);
    const offsetX = segment.worldX;
    this.platformManager.buildPlatforms(segment.definition.platforms, offsetX);
    this.hazardManager.spawnHazards(segment.definition.hazards, offsetX);
    this.pickupManager.spawnPickups(segment.definition.pickups, offsetX);
    this.activeSegments.push(segment);

    const newHazards = segment.definition.hazards
      .map((hazard) => hazard.type)
      .filter((type) => !this.seenHazards.has(type));
    newHazards.forEach((type) => this.seenHazards.add(type));
    if (newHazards.length > 0) {
      const toastText = newHazards.length === 1 ? newHazards[0] : newHazards.join(', ');
      this.hud.showHazardToast(`New Hazard: ${toastText}`);
    }

    return segment;
  }

  private tryAttachWeb(): AttachResult | null {
    const origin = new Phaser.Math.Vector2(this.player.sprite.x, this.player.sprite.y - 10);
    const direction = this.getAimDirection(origin);
    if (!direction) {
      this.guideColor = WEB_COLORS.none;
      return null;
    }

    const baseCone = this.settings.value.assists.aimAssistConeDegrees ?? AIM_ASSIST_BASE_DEGREES;
    const cone = aimAssistConeForDifficulty(baseCone + this.aimAssistBonus, this.currentDifficulty);
    const candidate = this.anchorScanner.findBestAnchor(origin, direction, cone);
    if (candidate && this.lineOfSightClear(origin, candidate.point)) {
      this.guideColor = candidate.type === 'beacon' ? WEB_COLORS.beacon : WEB_COLORS.surface;
      return candidate;
    }

    this.guideColor = WEB_COLORS.none;
    return null;
  }

  private updateWebAim(): void {
    const origin = new Phaser.Math.Vector2(this.player.sprite.x, this.player.sprite.y - 10);
    const direction = this.getAimDirection(origin);
    if (!direction) {
      this.web.hideGuideLine();
      this.setupCursorSprite('idle');
      return;
    }

    const baseCone = this.settings.value.assists.aimAssistConeDegrees ?? AIM_ASSIST_BASE_DEGREES;
    const cone = aimAssistConeForDifficulty(baseCone + this.aimAssistBonus, this.currentDifficulty);
    const candidate = this.anchorScanner.findBestAnchor(origin, direction, cone);
    if (candidate) {
      this.guideColor = candidate.type === 'beacon' ? WEB_COLORS.beacon : WEB_COLORS.surface;
      this.web.showGuideLine(origin, candidate.point, this.guideColor);
      this.setupCursorSprite(candidate.type === 'beacon' ? 'beacon' : 'surface');
    } else {
      const endPoint = origin.clone().add(direction.scale(WEB_MIN_LENGTH * 6));
      this.web.showGuideLine(origin, endPoint, WEB_COLORS.none);
      this.setupCursorSprite('idle');
    }
  }

  private lineOfSightClear(origin: Phaser.Math.Vector2, target: Phaser.Math.Vector2): boolean {
    const ray = new Phaser.Geom.Line(origin.x, origin.y, target.x, target.y);

    const platformBoxes = this.platformManager.getBoundingBoxes();
    for (const box of platformBoxes) {
      if (Phaser.Geom.Intersects.LineToRectangle(ray, box)) {
        return false;
      }
    }

    const hazardBodies = this.hazardManager.getHazardBodies();
    for (const body of hazardBodies) {
      const bounds = new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);
      if (Phaser.Geom.Intersects.LineToRectangle(ray, bounds)) {
        return false;
      }
    }

    return true;
  }

  private getAimDirection(origin: Phaser.Math.Vector2): Phaser.Math.Vector2 | null {
    const camera = this.cameras?.main;
    if (!camera) {
      return null;
    }
    const pointerWorld = this.cursorPointer.positionToCamera(camera) as Phaser.Math.Vector2;
    const direction = pointerWorld.clone().subtract(origin);
    if (direction.lengthSq() < 0.0001) {
      return null;
    }
    return direction.normalize();
  }

  private updateScrollSpeed(delta: number): void {
    this.scrollSpeed = Phaser.Math.Clamp(
      this.scrollSpeed + CAMERA_SCROLL_ACCEL * (delta / 1000),
      CAMERA_SCROLL_SPEED_START,
      Math.max(CAMERA_SCROLL_SPEED_MAX, scrollSpeedCapForDifficulty(this.currentDifficulty)),
    );
  }

  private updateCamera(delta: number): void {
    const deltaDistance = this.scrollSpeed * (delta / 1000);
    this.cameras.main.scrollX += deltaDistance;
    if (this.player.sprite.x < this.cameras.main.worldView.left + 32) {
      this.handlePlayerKO('Left boundary');
    }
  }

  private updateDistance(delta: number): void {
    const deltaDistancePx = this.scrollSpeed * (delta / 1000);
    const deltaMeters = deltaDistancePx / PIXELS_PER_METER;
    this.distanceTravelled += deltaMeters;
    this.elapsedTime += delta / 1000;
    this.currentDifficulty = difficultyForDistance(this.distanceTravelled);
    this.scoreManager.updateDistance(this.distanceTravelled);
    this.hud.setDistance(this.distanceTravelled);
    const speedRatio = Phaser.Math.Clamp(
      (this.scrollSpeed - CAMERA_SCROLL_SPEED_START) /
        (CAMERA_SCROLL_SPEED_MAX - CAMERA_SCROLL_SPEED_START),
      0,
      1,
    );
    this.hud.setSpeed(this.scrollSpeed, speedRatio);
  }

  private updateSegments(): void {
    const leftBound = this.cameras.main.worldView.left;
    this.platformManager.prune(leftBound);
    this.hazardManager.prune(leftBound);
    this.pickupManager.prune(leftBound);
    const prunedAnchors = this.anchorManager.prune(leftBound);
    this.anchorScanner.updateSurfaceAnchors(prunedAnchors.surfacePoints);
    this.anchorScanner.updateBeaconZones(prunedAnchors.beaconZones);

    const rightEdge = this.cameras.main.worldView.right;
    const upcomingThreshold = this.segmentGenerator.length - rightEdge;
    if (upcomingThreshold < GAME_WIDTH * 2) {
      const segment = this.spawnNextSegment(this.currentDifficulty);
      const anchors = this.anchorManager.appendSegments([segment]);
      this.anchorScanner.updateSurfaceAnchors(anchors.surfacePoints);
      this.anchorScanner.updateBeaconZones(anchors.beaconZones);
    }
  }

  private handlePlayerKO(reason = 'Left boundary'): void {
    if (this.runEnded) return;
    this.runEnded = true;
    this.collisionManager.destroy();
    this.setTimeScale(1);
    const snapshot = this.scoreManager.getSnapshot();
    const closestNearMiss = Number.isFinite(this.closestNearMiss) ? this.closestNearMiss : 0;
    this.scene.launch('ResultsScene', {
      distance: this.distanceTravelled,
      duration: this.elapsedTime,
      topSpeed: this.scrollSpeed,
      longestChain: snapshot.longestChain,
      closestNearMiss,
      score: snapshot.totalScore,
      nearMisses: snapshot.nearMisses,
      beaconHits: snapshot.beaconHits,
      multiplier: snapshot.multiplier,
      hazardsCleared: this.seenHazards.size,
      pickupsUsed: this.pickupsCollected,
      runSeed: this.segmentGenerator.seed,
      reason,
    });
    this.scene.stop();
  }

  private pauseGame(): void {
    if (this.scene.isActive('PauseOverlay')) return;
    this.scene.launch('PauseOverlay');
    this.scene.pause();
  }

  private setupCursorSprite(state: keyof typeof CURSOR_TEXTURES): void {
    if (this.currentCursorState === state) return;
    this.currentCursorState = state;
    const cursorKey = CURSOR_TEXTURES[state];
    const texture = this.textures.exists(cursorKey)
      ? `url('assets/ui/${cursorKey}.png') 8 8, pointer`
      : 'crosshair';
    this.input.setDefaultCursor(texture);
  }

  private handleHazardCollision(hazardType: string): void {
    this.handlePlayerKO(`Hazard: ${hazardType}`);
  }

  private handlePickupCollected(pickup: Pickup): void {
    const now = this.time.now;
    const expiresAt = now + pickup.durationMs;
    this.activeEffects.set(pickup.type, expiresAt);
    this.pickupDisplay = { type: pickup.type, expiresAt, duration: pickup.durationMs };
    this.hud.setPickup(this.getPickupLabel(pickup.type), pickup.colour);
    this.hud.setPickupProgress(1);
    this.pickupsCollected += 1;
    this.refreshPickupState();
  }

  private scheduleReelReset(delay = 140): void {
    if (this.reelInputResetTimer) {
      this.reelInputResetTimer.remove(false);
    }
    this.reelInputResetTimer = this.time.addEvent({
      delay,
      callback: () => {
        this.reelInput = 0;
        this.reelInputResetTimer = undefined;
      },
    });
  }

  private updatePickupEffects(): void {
    const now = this.time.now;
    let refresh = false;

    this.activeEffects.forEach((expiresAt, type) => {
      if (now >= expiresAt) {
        this.activeEffects.delete(type);
        refresh = true;
      }
    });

    if (refresh) {
      this.refreshPickupState();
    }

    if (this.pickupDisplay) {
      const remaining = Math.max(this.pickupDisplay.expiresAt - now, 0);
      const progress = this.pickupDisplay.duration > 0 ? remaining / this.pickupDisplay.duration : 0;
      this.hud.setPickupProgress(progress);
      if (remaining <= 0) {
        this.pickupDisplay = undefined;
        this.hud.setPickup('None');
        this.hud.setPickupProgress(0);
      }
    }
  }

  private refreshPickupState(): void {
    const hasLongerWeb = this.activeEffects.has('longerWeb');
    const hasSlowMo = this.activeEffects.has('slowMo');
    const hasDoubleJump = this.activeEffects.has('doubleJump');
    const hasMagnet = this.activeEffects.has('anchorMagnet');

    const minLength = hasLongerWeb ? WEB_MIN_LENGTH * 0.7 : WEB_MIN_LENGTH;
    const maxLength = hasLongerWeb ? WEB_MAX_LENGTH * 1.4 : WEB_MAX_LENGTH;
    this.web.setLengthBounds(minLength, maxLength);

    this.setTimeScale(hasSlowMo ? SLOWMO_SCALE : 1);
    this.player.enableDoubleJump(hasDoubleJump);
    this.aimAssistBonus = hasMagnet ? AIM_ASSIST_BEACON_BONUS : 0;
  }

  private setTimeScale(scale: number): void {
    this.physics.world.timeScale = scale;
    this.time.timeScale = scale;
    this.tweens.timeScale = scale;
  }

  private updateGroundedScoreState(): void {
    const grounded = this.player.body.blocked.down;
    if (grounded && !this.lastGroundedForScore) {
      this.scoreManager.registerGrounded();
    }
    this.lastGroundedForScore = grounded;
  }

  private checkNearMisses(): void {
    const now = this.time.now;
    const playerX = this.player.sprite.x;
    const playerY = this.player.sprite.y;

    for (const body of this.hazardManager.getHazardBodies()) {
      const hazardObject = body.gameObject as Phaser.GameObjects.GameObject;
      if (!hazardObject) continue;
      const centerX = body.x + body.width / 2;
      const centerY = body.y + body.height / 2;
      const distancePx = Phaser.Math.Distance.Between(playerX, playerY, centerX, centerY);
      if (distancePx > 0 && distancePx < 96) {
        const cooldownUntil = this.nearMissCooldown.get(hazardObject) ?? 0;
        if (now >= cooldownUntil) {
          this.scoreManager.registerNearMiss();
          this.nearMissCooldown.set(hazardObject, now + 1500);
          const distanceMeters = distancePx / PIXELS_PER_METER;
          this.closestNearMiss = Math.min(this.closestNearMiss, distanceMeters);
        }
      }
    }
  }

  private updateHudFromScore(): void {
    const snapshot = this.scoreManager.getSnapshot();
    this.hud.setMultiplier(snapshot.multiplier);
    this.hud.setScore(snapshot.totalScore);
  }

  private getPickupLabel(type: PickupType): string {
    switch (type) {
      case 'longerWeb':
        return 'Longer Web';
      case 'slowMo':
        return 'Slow Motion';
      case 'doubleJump':
        return 'Double Jump';
      case 'anchorMagnet':
        return 'Anchor Magnet';
      default:
        return 'Pickup';
    }
  }

  private syncPlayerWebState(): void {
    const tethered = this.web.isTethered;
    if (tethered !== this.lastTetheredState) {
      this.player.toggleAirControl(tethered);
      this.lastTetheredState = tethered;
    }
  }
}
