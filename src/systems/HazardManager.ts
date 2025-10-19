import Phaser from 'phaser';
import { HazardDefinition, HazardType } from './SegmentGenerator';

interface HazardManagerConfig {
  scene: Phaser.Scene;
}

interface HazardInstance {
  type: HazardType;
  object: Phaser.GameObjects.GameObject;
  update?: (time: number, delta: number) => void;
  onDestroy?: () => void;
  data?: Record<string, unknown>;
}

export class HazardManager {
  private readonly scene: Phaser.Scene;
  private readonly hazardGroup: Phaser.Physics.Arcade.Group;
  private readonly projectileGroup: Phaser.Physics.Arcade.Group;
  private readonly hazards: HazardInstance[] = [];

  constructor(config: HazardManagerConfig) {
    this.scene = config.scene;
    this.hazardGroup = this.scene.physics.add.group({ allowGravity: false, immovable: true });
    this.projectileGroup = this.scene.physics.add.group({ allowGravity: false, immovable: false });
  }

  get activeHazards(): Phaser.Physics.Arcade.Group {
    return this.hazardGroup;
  }

  get projectiles(): Phaser.Physics.Arcade.Group {
    return this.projectileGroup;
  }

  spawnHazards(hazards: HazardDefinition[], offsetX: number): void {
    hazards.forEach((definition) => {
      const instance = this.buildHazard(definition, offsetX);
      if (instance) {
        this.hazards.push(instance);
      }
    });
  }

  update(time: number, delta: number): void {
    this.hazards.forEach((hazard) => {
      hazard.update?.(time, delta);
    });
  }

  prune(leftBound: number): void {
    for (let i = this.hazards.length - 1; i >= 0; i -= 1) {
      const hazard = this.hazards[i];
      const object = hazard.object as Phaser.GameObjects.Components.Transform;
      if (object.x + (object as any).width / 2 < leftBound - 128) {
        hazard.onDestroy?.();
        hazard.object.destroy();
        this.hazards.splice(i, 1);
      }
    }

    this.projectileGroup.children.each((projectile) => {
      const body = projectile.body as Phaser.Physics.Arcade.Body;
      if (body.x + body.width < leftBound - 128) {
        projectile.destroy();
      }
    });
  }

  clear(): void {
    this.hazards.forEach((hazard) => {
      hazard.onDestroy?.();
      hazard.object.destroy();
    });
    this.hazards.length = 0;
    this.hazardGroup.clear(true, true);
    this.projectileGroup.clear(true, true);
  }

  getHazardBodies(): Phaser.Physics.Arcade.Body[] {
    const bodies: Phaser.Physics.Arcade.Body[] = [];
    this.hazardGroup.children.each((child) => {
      if (child.body) {
        bodies.push(child.body as Phaser.Physics.Arcade.Body);
      }
    });
    this.projectileGroup.children.each((child) => {
      if (child.body) {
        bodies.push(child.body as Phaser.Physics.Arcade.Body);
      }
    });
    return bodies;
  }

  private buildHazard(def: HazardDefinition, offsetX: number): HazardInstance | null {
    switch (def.type) {
      case 'spikes':
        return this.createSpikeField(def, offsetX);
      case 'saw':
        return this.createSaw(def, offsetX);
      case 'laser':
        return this.createLaser(def, offsetX);
      case 'wind':
        return this.createWind(def, offsetX);
      case 'swing-gate':
        return this.createSwingGate(def, offsetX);
      case 'electric':
        return this.createElectricArc(def, offsetX);
      case 'turret':
        return this.createTurret(def, offsetX);
      default:
        return this.createDebugHazard(def, offsetX);
    }
  }

  private createSpikeField(def: HazardDefinition, offsetX: number): HazardInstance {
    const width = def.width ?? 64;
    const height = def.height ?? 24;
    const rect = this.scene.add.rectangle(offsetX + def.x + width / 2, def.y, width, height, 0xff5c5c, 1);
    rect.setOrigin(0.5, 1);
    this.scene.physics.add.existing(rect);
    const body = rect.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    rect.setData('hazard', 'spikes');
    this.hazardGroup.add(rect);
    return { type: 'spikes', object: rect };
  }

  private createSaw(def: HazardDefinition, offsetX: number): HazardInstance {
    const radius = (def.width ?? 64) / 2;
    const circle = this.scene.add.circle(offsetX + def.x + radius, def.y - radius, radius, 0xf97316, 1);
    circle.setOrigin(0.5, 0.5);
    this.scene.physics.add.existing(circle);
    const body = circle.body as Phaser.Physics.Arcade.Body;
    body.setCircle(radius);
    body.setAllowGravity(false);
    body.setImmovable(true);
    circle.setData('hazard', 'saw');
    this.hazardGroup.add(circle);

    const path = def.data?.path as { x: number; y: number; length: number } | undefined;
    if (path) {
      const startY = def.y - radius;
      const targetY = path.y;
      this.scene.tweens.add({
        targets: circle,
        y: targetY,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    const update = (_time: number, _delta: number) => {
      circle.rotation += 0.25;
    };

    return { type: 'saw', object: circle, update };
  }

  private createLaser(def: HazardDefinition, offsetX: number): HazardInstance {
    const width = def.width ?? 220;
    const height = def.height ?? 12;
    const rect = this.scene.add.rectangle(offsetX + def.x + width / 2, def.y, width, height, 0xff4d6d, 0.2);
    rect.setOrigin(0.5, 1);
    this.scene.physics.add.existing(rect);
    const body = rect.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    rect.setData('hazard', 'laser');
    rect.setData('active', false);
    this.hazardGroup.add(rect);

    const cycle = Number((def.data as any)?.cycle ?? 2400);
    const active = Number((def.data as any)?.active ?? 1200);
    let timer = 0;

    const update = (_time: number, delta: number) => {
      timer = (timer + delta) % cycle;
      const isActive = timer <= active;
      rect.setData('active', isActive);
      rect.setFillStyle(0xff4d6d, isActive ? 0.9 : 0.15);
      body.checkCollision.none = !isActive;
    };

    return { type: 'laser', object: rect, update };
  }

  private createWind(def: HazardDefinition, offsetX: number): HazardInstance {
    const width = def.width ?? 140;
    const height = def.height ?? 160;
    const rect = this.scene.add.rectangle(offsetX + def.x + width / 2, def.y, width, height, 0x60a5fa, 0.25);
    rect.setOrigin(0.5, 1);
    this.scene.physics.add.existing(rect);
    const body = rect.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    rect.setData('hazard', 'wind');
    const direction = (def.data as any)?.direction ?? 'up';
    const strength = Number((def.data as any)?.strength ?? 0.4);
    rect.setData('direction', direction);
    rect.setData('strength', strength);
    this.hazardGroup.add(rect);

    return { type: 'wind', object: rect, data: def.data ?? {} };
  }

  private createSwingGate(def: HazardDefinition, offsetX: number): HazardInstance {
    const width = def.width ?? 160;
    const height = def.height ?? 16;
    const gate = this.scene.add.rectangle(offsetX + def.x, def.y, width, height, 0x7c3aed, 0.6);
    gate.setOrigin(0, 0.5);
    this.scene.physics.add.existing(gate);
    const body = gate.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    gate.setData('hazard', 'swing-gate');
    this.hazardGroup.add(gate);

    this.scene.tweens.add({
      targets: gate,
      angle: 50,
      duration: 900,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true,
    });

    return { type: 'swing-gate', object: gate };
  }

  private createElectricArc(def: HazardDefinition, offsetX: number): HazardInstance {
    const width = def.width ?? 200;
    const height = def.height ?? 24;
    const rect = this.scene.add.rectangle(offsetX + def.x + width / 2, def.y, width, height, 0x38bdf8, 0.25);
    rect.setOrigin(0.5, 1);
    this.scene.physics.add.existing(rect);
    const body = rect.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    rect.setData('hazard', 'electric');
    rect.setData('active', false);
    this.hazardGroup.add(rect);

    const cycle = Number((def.data as any)?.cycle ?? 1800);
    const active = Number((def.data as any)?.active ?? 900);
    let timer = 0;

    const update = (_time: number, delta: number) => {
      timer = (timer + delta) % cycle;
      const isActive = timer <= active;
      rect.setData('active', isActive);
      rect.setFillStyle(0x38bdf8, isActive ? 0.8 : 0.25);
      body.checkCollision.none = !isActive;
    };

    return { type: 'electric', object: rect, update };
  }

  private createTurret(def: HazardDefinition, offsetX: number): HazardInstance {
    const base = this.scene.add.rectangle(offsetX + def.x, def.y, def.width ?? 32, def.height ?? 32, 0x4ade80, 0.8);
    base.setOrigin(0.5, 1);
    this.scene.physics.add.existing(base);
    const body = base.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    base.setData('hazard', 'turret');
    this.hazardGroup.add(base);

    const fireRate = Number((def.data as any)?.fireRate ?? 1600);
    const bulletSpeed = Number((def.data as any)?.bulletSpeed ?? 240);

    const timer = this.scene.time.addEvent({
      delay: fireRate,
      loop: true,
      callback: () => {
        const projectile = this.scene.add.rectangle(
          base.x,
          base.y - (base.height ?? 32) * 0.5,
          14,
          10,
          0xfacc15,
          1,
        );
        projectile.setOrigin(0.5, 0.5);
        this.scene.physics.add.existing(projectile);
        const projectileBody = projectile.body as Phaser.Physics.Arcade.Body;
        projectileBody.setAllowGravity(false);
        projectileBody.setVelocityX(-bulletSpeed);
        projectile.setData('hazard', 'turret');
        this.projectileGroup.add(projectile);
      },
    });

    const onDestroy = () => {
      timer.remove(false);
    };

    return { type: 'turret', object: base, onDestroy };
  }

  private createDebugHazard(def: HazardDefinition, offsetX: number): HazardInstance {
    const width = def.width ?? 80;
    const height = def.height ?? 40;
    const rect = this.scene.add.rectangle(offsetX + def.x + width / 2, def.y, width, height, 0xffa64c, 0.5);
    rect.setOrigin(0.5, 1);
    rect.setData('hazard', def.type ?? 'hazard');
    this.scene.physics.add.existing(rect);
    const body = rect.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    this.hazardGroup.add(rect);
    return { type: def.type, object: rect } as HazardInstance;
  }
}
