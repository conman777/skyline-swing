import { SegmentDefinition } from '../systems/SegmentGenerator';

export const segmentPool: SegmentDefinition[] = [
  {
    key: 'safe_intro_01',
    width: 640,
    difficulty: 1,
    anchors: [
      { x: 120, y: 220 },
      { x: 260, y: 260 },
      { x: 380, y: 210 },
      { x: 520, y: 240 },
    ],
    platforms: [
      { x: 0, y: 710, width: 640, height: 32, type: 'ground' },
    ],
    hazards: [],
    pickups: [{ type: 'longerWeb', x: 320, y: 620 }],
  },
  {
    key: 'safe_intro_02',
    width: 720,
    difficulty: 1,
    anchors: [
      { x: 120, y: 210 },
      { x: 260, y: 200 },
      { x: 420, y: 250 },
      { x: 600, y: 210 },
    ],
    platforms: [
      { x: 0, y: 710, width: 380, height: 32 },
      { x: 420, y: 680, width: 300, height: 32 },
    ],
    hazards: [],
    pickups: [{ type: 'slowMo', x: 520, y: 640 }],
  },
  {
    key: 'hazard_spikes_01',
    width: 720,
    difficulty: 2,
    anchors: [
      { x: 120, y: 200 },
      { x: 320, y: 240 },
      { x: 500, y: 220 },
      { x: 620, y: 260 },
    ],
    platforms: [
      { x: 0, y: 710, width: 720, height: 32 },
    ],
    hazards: [
      { type: 'spikes', x: 260, y: 702, width: 120, height: 16 },
    ],
  },
  {
    key: 'hazard_crumble_01',
    width: 760,
    difficulty: 2,
    anchors: [
      { x: 180, y: 220 },
      { x: 320, y: 180 },
      { x: 520, y: 230 },
      { x: 670, y: 200 },
    ],
    platforms: [
      { x: 0, y: 710, width: 240, height: 32 },
      { x: 300, y: 680, width: 120, height: 24, type: 'crumble' },
      { x: 460, y: 710, width: 300, height: 32 },
    ],
    hazards: [],
  },
  {
    key: 'hazard_saw_01',
    width: 820,
    difficulty: 3,
    anchors: [
      { x: 160, y: 220 },
      { x: 280, y: 190 },
      { x: 460, y: 210 },
      { x: 640, y: 230 },
      { x: 760, y: 200 },
    ],
    platforms: [
      { x: 0, y: 710, width: 820, height: 32 },
    ],
    hazards: [
      { type: 'saw', x: 360, y: 690, width: 64, height: 64, data: { path: { x: 360, y: 630, length: 120 } } },
    ],
  },
  {
    key: 'hazard_laser_01',
    width: 860,
    difficulty: 4,
    anchors: [
      { x: 140, y: 210 },
      { x: 320, y: 190 },
      { x: 540, y: 220 },
      { x: 720, y: 180, kind: 'beacon' },
      { x: 800, y: 240 },
    ],
    platforms: [
      { x: 0, y: 710, width: 860, height: 32 },
    ],
    hazards: [
      { type: 'laser', x: 420, y: 650, width: 220, height: 16, data: { cycle: 2200, active: 1200 } },
    ],
  },
  {
    key: 'hazard_mix_01',
    width: 900,
    difficulty: 5,
    anchors: [
      { x: 160, y: 210 },
      { x: 340, y: 230 },
      { x: 520, y: 180, kind: 'beacon' },
      { x: 700, y: 220 },
      { x: 840, y: 200 },
    ],
    platforms: [
      { x: 0, y: 710, width: 300, height: 32 },
      { x: 340, y: 660, width: 120, height: 24, type: 'crumble' },
      { x: 520, y: 710, width: 380, height: 32 },
    ],
    hazards: [
      { type: 'spikes', x: 520, y: 702, width: 80, height: 16 },
      { type: 'wind', x: 430, y: 610, width: 120, height: 160, data: { direction: 'up', strength: 0.6 } },
    ],
    pickups: [{ type: 'anchorMagnet', x: 140, y: 600 }],
  },

  // Difficulty 3 - Intermediate challenges
  {
    key: 'gap_swing_01',
    width: 800,
    difficulty: 3,
    anchors: [
      { x: 140, y: 220 },
      { x: 320, y: 180 },
      { x: 540, y: 210 },
      { x: 720, y: 230 },
    ],
    platforms: [
      { x: 0, y: 710, width: 280, height: 32 },
      { x: 460, y: 710, width: 340, height: 32 },
    ],
    hazards: [],
    pickups: [],
  },
  {
    key: 'electric_gauntlet_01',
    width: 840,
    difficulty: 3,
    anchors: [
      { x: 180, y: 220 },
      { x: 360, y: 200 },
      { x: 560, y: 190 },
      { x: 740, y: 220 },
    ],
    platforms: [
      { x: 0, y: 710, width: 840, height: 32 },
    ],
    hazards: [
      { type: 'electric', x: 300, y: 680, width: 16, height: 60, data: { cycle: 2000, active: 1000 } },
      { type: 'electric', x: 520, y: 680, width: 16, height: 60, data: { cycle: 2000, active: 1000, offset: 1000 } },
    ],
  },

  // Difficulty 4 - Advanced patterns
  {
    key: 'turret_corridor_01',
    width: 920,
    difficulty: 4,
    anchors: [
      { x: 160, y: 180 },
      { x: 340, y: 210 },
      { x: 540, y: 190, kind: 'beacon' },
      { x: 740, y: 220 },
      { x: 860, y: 200 },
    ],
    platforms: [
      { x: 0, y: 710, width: 920, height: 32 },
    ],
    hazards: [
      { type: 'turret', x: 280, y: 100, width: 32, height: 32, data: { fireRate: 1800, projectileSpeed: 200 } },
      { type: 'turret', x: 620, y: 80, width: 32, height: 32, data: { fireRate: 1600, projectileSpeed: 220 } },
    ],
  },
  {
    key: 'swing_gate_valley_01',
    width: 880,
    difficulty: 4,
    anchors: [
      { x: 140, y: 200 },
      { x: 320, y: 180 },
      { x: 560, y: 220 },
      { x: 760, y: 190 },
    ],
    platforms: [
      { x: 0, y: 710, width: 240, height: 32 },
      { x: 640, y: 710, width: 240, height: 32 },
    ],
    hazards: [
      { type: 'swing-gate', x: 420, y: 150, width: 80, height: 20, data: { angle: Math.PI / 3, period: 2500 } },
    ],
  },

  // Difficulty 5 - Complex combinations
  {
    key: 'multi_hazard_01',
    width: 960,
    difficulty: 5,
    anchors: [
      { x: 180, y: 210 },
      { x: 360, y: 190, kind: 'beacon' },
      { x: 560, y: 220 },
      { x: 740, y: 180 },
      { x: 880, y: 210 },
    ],
    platforms: [
      { x: 0, y: 710, width: 320, height: 32 },
      { x: 400, y: 680, width: 100, height: 24, type: 'crumble' },
      { x: 580, y: 710, width: 380, height: 32 },
    ],
    hazards: [
      { type: 'saw', x: 460, y: 660, width: 64, height: 64, data: { path: { x: 460, y: 600, length: 100 } } },
      { type: 'spikes', x: 620, y: 702, width: 100, height: 16 },
      { type: 'laser', x: 720, y: 640, width: 180, height: 16, data: { cycle: 1800, active: 1000 } },
    ],
  },
  {
    key: 'wind_tunnel_01',
    width: 900,
    difficulty: 5,
    anchors: [
      { x: 160, y: 220 },
      { x: 340, y: 180 },
      { x: 580, y: 210 },
      { x: 800, y: 190 },
    ],
    platforms: [
      { x: 0, y: 710, width: 900, height: 32 },
    ],
    hazards: [
      { type: 'wind', x: 340, y: 580, width: 280, height: 180, data: { direction: 'down', strength: 0.8 } },
      { type: 'spikes', x: 360, y: 702, width: 240, height: 16 },
    ],
    pickups: [{ type: 'doubleJump', x: 160, y: 600 }],
  },

  // Difficulty 6 - Expert challenges
  {
    key: 'expert_precision_01',
    width: 1000,
    difficulty: 6,
    anchors: [
      { x: 160, y: 190 },
      { x: 340, y: 220 },
      { x: 540, y: 170, kind: 'beacon' },
      { x: 740, y: 210 },
      { x: 920, y: 180 },
    ],
    platforms: [
      { x: 0, y: 710, width: 220, height: 32 },
      { x: 300, y: 680, width: 80, height: 24, type: 'crumble' },
      { x: 460, y: 660, width: 100, height: 24, type: 'crumble' },
      { x: 640, y: 710, width: 360, height: 32 },
    ],
    hazards: [
      { type: 'electric', x: 420, y: 640, width: 16, height: 60, data: { cycle: 1600, active: 800 } },
      { type: 'turret', x: 720, y: 120, width: 32, height: 32, data: { fireRate: 1400, projectileSpeed: 250 } },
    ],
  },
  {
    key: 'laser_grid_01',
    width: 980,
    difficulty: 6,
    anchors: [
      { x: 180, y: 200 },
      { x: 380, y: 180, kind: 'beacon' },
      { x: 600, y: 220 },
      { x: 820, y: 190 },
    ],
    platforms: [
      { x: 0, y: 710, width: 980, height: 32 },
    ],
    hazards: [
      { type: 'laser', x: 300, y: 600, width: 200, height: 16, data: { cycle: 1600, active: 900 } },
      { type: 'laser', x: 480, y: 650, width: 220, height: 16, data: { cycle: 1600, active: 900, offset: 800 } },
      { type: 'laser', x: 720, y: 620, width: 180, height: 16, data: { cycle: 1600, active: 900, offset: 400 } },
    ],
  },

  // Difficulty 7 - High-speed chaos
  {
    key: 'chaos_canyon_01',
    width: 1040,
    difficulty: 7,
    anchors: [
      { x: 160, y: 200 },
      { x: 340, y: 180 },
      { x: 540, y: 210, kind: 'beacon' },
      { x: 740, y: 170 },
      { x: 940, y: 200 },
    ],
    platforms: [
      { x: 0, y: 710, width: 260, height: 32 },
      { x: 340, y: 680, width: 100, height: 24, type: 'crumble' },
      { x: 520, y: 660, width: 120, height: 24, type: 'crumble' },
      { x: 720, y: 710, width: 320, height: 32 },
    ],
    hazards: [
      { type: 'saw', x: 400, y: 660, width: 64, height: 64, data: { path: { x: 400, y: 580, length: 140 } } },
      { type: 'swing-gate', x: 620, y: 140, width: 80, height: 20, data: { angle: Math.PI / 2.5, period: 2000 } },
      { type: 'electric', x: 780, y: 680, width: 16, height: 60, data: { cycle: 1400, active: 700 } },
    ],
  },
  {
    key: 'turret_swarm_01',
    width: 1020,
    difficulty: 7,
    anchors: [
      { x: 180, y: 180 },
      { x: 380, y: 210 },
      { x: 600, y: 170, kind: 'beacon' },
      { x: 840, y: 200 },
    ],
    platforms: [
      { x: 0, y: 710, width: 1020, height: 32 },
    ],
    hazards: [
      { type: 'turret', x: 280, y: 90, width: 32, height: 32, data: { fireRate: 1200, projectileSpeed: 280 } },
      { type: 'turret', x: 520, y: 60, width: 32, height: 32, data: { fireRate: 1300, projectileSpeed: 260 } },
      { type: 'turret', x: 760, y: 80, width: 32, height: 32, data: { fireRate: 1400, projectileSpeed: 270 } },
      { type: 'wind', x: 400, y: 600, width: 160, height: 140, data: { direction: 'left', strength: 0.5 } },
    ],
  },

  // Difficulty 8 - Master difficulty
  {
    key: 'master_gauntlet_01',
    width: 1100,
    difficulty: 8,
    anchors: [
      { x: 160, y: 190 },
      { x: 360, y: 170, kind: 'beacon' },
      { x: 580, y: 200 },
      { x: 800, y: 160, kind: 'beacon' },
      { x: 1000, y: 190 },
    ],
    platforms: [
      { x: 0, y: 710, width: 200, height: 32 },
      { x: 280, y: 680, width: 80, height: 24, type: 'crumble' },
      { x: 440, y: 660, width: 100, height: 24, type: 'crumble' },
      { x: 620, y: 680, width: 80, height: 24, type: 'crumble' },
      { x: 780, y: 710, width: 320, height: 32 },
    ],
    hazards: [
      { type: 'laser', x: 300, y: 640, width: 180, height: 16, data: { cycle: 1400, active: 800 } },
      { type: 'electric', x: 520, y: 640, width: 16, height: 60, data: { cycle: 1200, active: 600 } },
      { type: 'saw', x: 680, y: 660, width: 64, height: 64, data: { path: { x: 680, y: 570, length: 160 } } },
      { type: 'turret', x: 900, y: 100, width: 32, height: 32, data: { fireRate: 1100, projectileSpeed: 300 } },
    ],
  },

  // Difficulty 9 - Extreme patterns
  {
    key: 'extreme_velocity_01',
    width: 1140,
    difficulty: 9,
    anchors: [
      { x: 180, y: 180 },
      { x: 380, y: 160, kind: 'beacon' },
      { x: 600, y: 190 },
      { x: 840, y: 150, kind: 'beacon' },
      { x: 1060, y: 180 },
    ],
    platforms: [
      { x: 0, y: 710, width: 180, height: 32 },
      { x: 260, y: 670, width: 100, height: 24, type: 'crumble' },
      { x: 440, y: 650, width: 100, height: 24, type: 'crumble' },
      { x: 620, y: 670, width: 100, height: 24, type: 'crumble' },
      { x: 800, y: 710, width: 340, height: 32 },
    ],
    hazards: [
      { type: 'swing-gate', x: 340, y: 120, width: 80, height: 20, data: { angle: Math.PI / 2, period: 1600 } },
      { type: 'laser', x: 520, y: 610, width: 200, height: 16, data: { cycle: 1200, active: 700 } },
      { type: 'turret', x: 300, y: 70, width: 32, height: 32, data: { fireRate: 1000, projectileSpeed: 320 } },
      { type: 'turret', x: 740, y: 90, width: 32, height: 32, data: { fireRate: 1100, projectileSpeed: 310 } },
      { type: 'electric', x: 860, y: 680, width: 16, height: 60, data: { cycle: 1000, active: 500 } },
    ],
  },

  // Difficulty 10 - Ultimate challenge
  {
    key: 'ultimate_trial_01',
    width: 1200,
    difficulty: 10,
    anchors: [
      { x: 160, y: 170 },
      { x: 360, y: 150, kind: 'beacon' },
      { x: 580, y: 180 },
      { x: 800, y: 140, kind: 'beacon' },
      { x: 1020, y: 170 },
    ],
    platforms: [
      { x: 0, y: 710, width: 160, height: 32 },
      { x: 240, y: 680, width: 80, height: 24, type: 'crumble' },
      { x: 400, y: 650, width: 80, height: 24, type: 'crumble' },
      { x: 560, y: 670, width: 80, height: 24, type: 'crumble' },
      { x: 720, y: 640, width: 100, height: 24, type: 'crumble' },
      { x: 900, y: 710, width: 300, height: 32 },
    ],
    hazards: [
      { type: 'laser', x: 280, y: 640, width: 160, height: 16, data: { cycle: 1100, active: 650 } },
      { type: 'electric', x: 460, y: 630, width: 16, height: 60, data: { cycle: 900, active: 450 } },
      { type: 'saw', x: 620, y: 650, width: 64, height: 64, data: { path: { x: 620, y: 550, length: 180 } } },
      { type: 'turret', x: 340, y: 60, width: 32, height: 32, data: { fireRate: 900, projectileSpeed: 340 } },
      { type: 'turret', x: 760, y: 50, width: 32, height: 32, data: { fireRate: 950, projectileSpeed: 330 } },
      { type: 'swing-gate', x: 780, y: 100, width: 80, height: 20, data: { angle: Math.PI / 1.8, period: 1400 } },
      { type: 'wind', x: 420, y: 560, width: 240, height: 120, data: { direction: 'down', strength: 0.9 } },
    ],
    pickups: [{ type: 'doubleJump', x: 100, y: 580 }],
  },
];
