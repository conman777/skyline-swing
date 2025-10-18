import Phaser from 'phaser';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PIXELS_PER_METER = 60;

export const CAMERA_SCROLL_SPEED_START = 220; // pixels per second
export const CAMERA_SCROLL_SPEED_MAX = 520;
export const CAMERA_SCROLL_ACCEL = 4; // speed increase per second

export const CAMERA_VERTICAL_OFFSET = -100;
export const PLAYER_GRAVITY = 900;

export const PLAYER_RUN_SPEED = 320;
export const PLAYER_AIR_CONTROL = 0.35;
export const PLAYER_JUMP_VELOCITY = -420;
export const PLAYER_COYOTE_TIME = 120; // ms
export const PLAYER_JUMP_BUFFER = 100; // ms

export const WEB_MIN_LENGTH = 120; // pixels (~2 m if 60 px = 1 m)
export const WEB_MAX_LENGTH = 720; // pixels (~12 m)
export const WEB_REEL_SPEED = 150; // pixels per second (~2.5 m/s)
export const WEB_PULL_STRENGTH = 420; // force applied per meter of stretch
export const WEB_DAMPING = 2.6; // damping coefficient per second
export const WEB_ACCELERATION_CAP = 1800; // maximum acceleration applied by the web
export const WEB_TENSION_BREAK_FORCE = 1150; // approximate threshold
export const WEB_TANGENTIAL_SPEED_LIMIT = 900; // break if exceeded

export const AIM_ASSIST_BASE_DEGREES = 15;
export const AIM_ASSIST_BEACON_BONUS = 8;

export const PICKUP_DURATION_MS = {
  longerWeb: 15000,
  slowMo: 15000,
  doubleJump: 15000,
  anchorMagnet: 10000,
} as const;

export const SLOWMO_SCALE = 0.6;

export const SCORE_DISTANCE_RATIO = 0.1; // points per meter
export const SCORE_CHAIN_BONUS = 10;
export const SCORE_NEAR_MISS_BONUS = 25;
export const SCORE_BEACON_BONUS = 15;

export const RUN_SEED_LENGTH = 6;

export const SPEED_MULTIPLIER_THRESHOLDS = [280, 360, 420, 480];
export const SPEED_MULTIPLIER_STEP = 0.15;

export function difficultyForDistance(distanceMeters: number): number {
  const base = Math.floor(distanceMeters / 50);
  return Phaser.Math.Clamp ? Phaser.Math.Clamp(base + 1, 1, 10) : Math.min(Math.max(base + 1, 1), 10);
}

export function scrollSpeedCapForDifficulty(difficulty: number): number {
  const normalized = Math.min(Math.max(difficulty - 1, 0), 9);
  const bonus = normalized * 16;
  return CAMERA_SCROLL_SPEED_MAX + bonus;
}

export function aimAssistConeForDifficulty(baseCone: number, difficulty: number): number {
  const penalty = Math.max(difficulty - 3, 0) * 1.2;
  return Math.max(6, baseCone - penalty);
}

export function styleMultiplierForChain(chain: number, nearMisses: number): number {
  const chainBonus = Math.min(chain, 20) * 0.05;
  const nearMissBonus = Math.min(nearMisses, 10) * 0.08;
  return 1 + chainBonus + nearMissBonus;
}
