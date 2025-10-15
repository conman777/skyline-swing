import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Web } from '../entities/Web';
import { AnchorScanner } from '../entities/AnchorScanner';
import {
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
  WEB_MIN_LENGTH,
} from '../config/constants';
import { SettingsStore } from '../systems/SettingsStore';
import { segmentPool } from '../config/segments';
import { SegmentGenerator, GeneratedSegment } from '../systems/SegmentGenerator';
import { AnchorManager } from '../systems/AnchorManager';
import { PlatformManager } from '../systems/PlatformManager';
import { HazardManager } from '../systems/HazardManager';
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
  private styleMultiplier = 1;
  private seenHazards = new Set<string>();
  private lastTetheredState = false;
  private runEnded = false;

  private segmentGenerator!: SegmentGenerator;
  private anchorManager!: AnchorManager;
  private platformManager!: PlatformManager;
  private hazardManager!: HazardManager;
  private hazardOverlap?: Phaser.Physics.Arcade.Collider;
  private activeSegments: GeneratedSegment[] = [];

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
    this.physics.add.collider(this.player.sprite, this.platformManager.collider);
    this.hazardOverlap = this.physics.add.overlap(
      this.player.sprite,
      this.hazardManager.activeHazards,
      this.handleHazardHit,
      undefined,
      this,
    );
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

  update(_time: number, delta: number): void {
    this.updateScrollSpeed(delta);
    this.updateCamera(delta);
    this.updateDistance(delta);
    this.updateWebAim();
    this.web.setReelInput(this.reelInput);
    this.syncPlayerWebState();
    this.updateSegments();
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
        this.setupCursorSprite(target.type === 'beacon' ? 'beacon' : 'surface');
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
      this.reelInput = dy < 0 ? -1 : dy > 0 ? 1 : 0;
      this.reelInputResetTimer?.remove(false);
      this.reelInputResetTimer = this.time.delayedCall(140, () => {
        this.reelInput = 0;
        this.reelInputResetTimer = undefined;
      });
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
  }

  private spawnInitialSegments(): void {
    this.segmentGenerator.reset();
    this.platformManager.clear();
    this.hazardManager.clear();
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

    const cone = this.settings.value.assists.aimAssistConeDegrees ?? 15;
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

    const cone = this.settings.value.assists.aimAssistConeDegrees ?? 15;
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

  private lineOfSightClear(_origin: Phaser.Math.Vector2, _target: Phaser.Math.Vector2): boolean {
    // TODO: integrate with tilemap collision and hazard blockers.
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
      CAMERA_SCROLL_SPEED_MAX,
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
    this.hud.setDistance(this.distanceTravelled);
    this.hud.setMultiplier(this.styleMultiplier);
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
    const prunedAnchors = this.anchorManager.prune(leftBound);
    this.anchorScanner.updateSurfaceAnchors(prunedAnchors.surfacePoints);
    this.anchorScanner.updateBeaconZones(prunedAnchors.beaconZones);

    const rightEdge = this.cameras.main.worldView.right;
    const upcomingThreshold = this.segmentGenerator.length - rightEdge;
    if (upcomingThreshold < GAME_WIDTH * 2) {
      const segment = this.spawnNextSegment(Phaser.Math.Clamp(this.activeSegments.length + 1, 1, 5));
      const anchors = this.anchorManager.appendSegments([segment]);
      this.anchorScanner.updateSurfaceAnchors(anchors.surfacePoints);
      this.anchorScanner.updateBeaconZones(anchors.beaconZones);
    }
  }

  private handlePlayerKO(reason = 'Left boundary'): void {
    if (this.runEnded) return;
    this.runEnded = true;
    this.scene.launch('ResultsScene', {
      distance: this.distanceTravelled,
      duration: this.elapsedTime,
      topSpeed: this.scrollSpeed,
      longestChain: 0,
      closestNearMiss: 0,
      hazardsCleared: this.seenHazards.size,
      pickupsUsed: 0,
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

  private handleHazardHit(
    _player: Phaser.GameObjects.GameObject,
    hazard: Phaser.GameObjects.GameObject,
  ): void {
    const hazardType = (hazard.getData?.('hazard') as string) ?? 'hazard';
    this.handlePlayerKO(`Hazard: ${hazardType}`);
  }

  private syncPlayerWebState(): void {
    const tethered = this.web.isTethered;
    if (tethered !== this.lastTetheredState) {
      this.player.toggleAirControl(tethered);
      this.lastTetheredState = tethered;
    }
  }
}
