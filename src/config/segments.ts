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
];
