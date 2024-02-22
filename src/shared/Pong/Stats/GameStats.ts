import { ArenaWall } from '../Collisions/Arena';
import { GameObject } from '../GameObject';
import { Bar } from '../Paddles/Bar';
import { TeamStatistics } from './TeamStats';

export class GameStatistics {

  private totalBounces: number = 0; // increment when ball bounces

  public teamStats: TeamStatistics = new TeamStatistics();

  private currentBounceWithoutArenaBounce: number = 0; // increment when ball bounces, reset when ball bounces with arena
  private longestBounceWithoutArenaBounce: number = 0; // every time currentBounceWithoutArenaBounce > longestBounceWithoutArenaBounce, longestBounceWithoutArenaBounce = currentBounceWithoutArenaBounce

  private goalsScored: number = 0; // increment when goal is scored

  private currentBounceStreak: number = 0; // increment when ball bounces, reset when goal is scored
  private longestBounceStreak: number = 0; // every time currentBounceStreak > longestBounceStreak, longestBounceStreak = currentBounceStreak

  public startTime: number = 0; // Date.now() when game starts
  private endTime: number = 0; // Date.now() when game ends
  private gameDuration: number = 0; // endTime - startTime

  private currentRoundStartTime: number = 0; // Date.now() when goal is scored
  private currentRoundEndTime: number = 0; // Date.now() when next goal is scored
  private longestRoundDuration: number = 0; // every time currentRoundDuration > longestRoundDuration, longestRoundDuration = currentRoundDuration
  private shortestRoundDuration: number = 0; // every time currentRoundDuration < shortestRoundDuration, shortestRoundDuration = currentRoundDuration
  // shortestRoundDuration is set on first goal, so it's always > 0

  constructor() {}

  private get FirstRound(): boolean {
    return this.goalsScored == 0;
  }

  public increaseBounces(obj: GameObject): void {
    this.totalBounces++;
    if (!(obj instanceof ArenaWall)) {
      this.currentBounceWithoutArenaBounce++;
      if (this.currentBounceWithoutArenaBounce > this.longestBounceWithoutArenaBounce) {
        this.longestBounceWithoutArenaBounce = this.currentBounceWithoutArenaBounce;
      }
    } else {
      this.currentBounceWithoutArenaBounce = 0;
    }

    this.currentBounceStreak++;
    if (this.currentBounceStreak > this.longestBounceStreak) {
      this.longestBounceStreak = this.currentBounceStreak;
    }
    if (obj instanceof Bar) {
      obj.stats.increaseBallBounces();
    }
  }

  public startTimer(): void {
    this.startTime = Date.now();
  }

  public startNewRound(): void {
    this.currentRoundStartTime = Date.now();
    this.currentBounceStreak = 0;
  }

  public goalScored(): void {
    // first round
    this.currentRoundEndTime = Date.now();
    const roundDuration = this.currentRoundEndTime - this.currentRoundStartTime;
    if (roundDuration > this.longestRoundDuration) {
      this.longestRoundDuration = roundDuration;
    } else if (roundDuration < this.shortestRoundDuration || this.FirstRound) {
      this.shortestRoundDuration = roundDuration;
    }

    this.goalsScored++;
    this.startNewRound();
  }

  public gameOver(): void {
    this.endTime = Date.now();
    this.gameDuration = this.endTime - this.startTime;
  }

  public exportStats(): {} {
    return ({
      totalBounces: this.totalBounces,
      longestBounceWithoutArenaBounce: this.longestBounceWithoutArenaBounce,
      goalsScored: this.goalsScored,
      longestBounceStreak: this.longestBounceStreak,
      gameDuration: this.gameDuration,
      longestRoundDuration: this.longestRoundDuration,
      shortestRoundDuration: this.shortestRoundDuration,
    });
  }
}
