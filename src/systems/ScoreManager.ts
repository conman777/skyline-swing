import {
  SCORE_BEACON_BONUS,
  SCORE_CHAIN_BONUS,
  SCORE_DISTANCE_RATIO,
  SCORE_NEAR_MISS_BONUS,
  styleMultiplierForChain,
} from '../config/constants';

interface ScoreSnapshot {
  totalScore: number;
  chainCount: number;
  nearMisses: number;
  beaconHits: number;
  multiplier: number;
  longestChain: number;
}

export class ScoreManager {
  private distanceMeters = 0;
  private chainCount = 0;
  private nearMissCount = 0;
  private beaconCount = 0;
  private baseScore = 0;
  private bonusScore = 0;
  private styleMultiplier = 1;
  private longestChain = 0;

  reset(): void {
    this.distanceMeters = 0;
    this.chainCount = 0;
    this.nearMissCount = 0;
    this.beaconCount = 0;
    this.baseScore = 0;
    this.bonusScore = 0;
    this.styleMultiplier = 1;
    this.longestChain = 0;
  }

  updateDistance(distanceMeters: number): void {
    this.distanceMeters = distanceMeters;
    this.baseScore = distanceMeters * SCORE_DISTANCE_RATIO;
  }

  registerSwing(success: boolean): void {
    if (success) {
      this.chainCount += 1;
      this.bonusScore += SCORE_CHAIN_BONUS;
      this.longestChain = Math.max(this.longestChain, this.chainCount);
    } else {
      this.chainCount = 0;
    }
    this.updateStyleMultiplier();
  }

  registerGrounded(): void {
    this.chainCount = 0;
    this.updateStyleMultiplier();
  }

  registerNearMiss(): void {
    this.nearMissCount += 1;
    this.bonusScore += SCORE_NEAR_MISS_BONUS;
    this.updateStyleMultiplier();
  }

  registerBeaconUse(): void {
    this.beaconCount += 1;
    this.bonusScore += SCORE_BEACON_BONUS;
  }

  getSnapshot(): ScoreSnapshot {
    return {
      totalScore: Math.round((this.baseScore + this.bonusScore) * this.styleMultiplier),
      chainCount: this.chainCount,
      nearMisses: this.nearMissCount,
      beaconHits: this.beaconCount,
      multiplier: this.styleMultiplier,
      longestChain: this.longestChain,
    };
  }

  get multiplier(): number {
    return this.styleMultiplier;
  }

  private updateStyleMultiplier(): void {
    this.styleMultiplier = styleMultiplierForChain(this.chainCount, this.nearMissCount);
  }
}
