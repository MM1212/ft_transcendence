import PongModel from '../../../typings/models/pong/index';
import { Bar } from '../Paddles/Bar';

export class BarStatistics {
  private goalsScored: number = 0; // increment when goal is scored
  private shotsFired: number = 0; // increment when power is fired
  private shotHit: number = 0; // increment when power hit something
  private hittenByPower: number = 0; // increment when hit by power
  private powerAccuracy: number = 0; // (shotHit / shotsFired) * 100

  private manaSpent: number = 0; // shotsFired * powerCost

  private bubble_DirectGoal: number = 0; // increment when goal and last collider was bubble
  private fire_DirectGoal: number = 0; // increment when goal and last collider was fire
  private ice_ScoredOpponentAffected: number = 0; // increment when goal and opponent status === status.slowed or status.frozen
  private spark_ScoredOpponentAffected: number = 0; // increment when goal and opponent status === status.inverted
  private ghost_ScoredOpponentInvisible: number = 0; // increment when goal and any obj status === status.invisible

  constructor(private powerCost: number) {}

  public incrementSpecialPowerStat(power: string) {
    if (power === PongModel.Models.LobbyParticipantSpecialPowerType.none)
      return;
    else if (power === PongModel.Models.LobbyParticipantSpecialPowerType.bubble)
      this.bubble_DirectGoal++;
    else if (power === PongModel.Models.LobbyParticipantSpecialPowerType.fire)
      this.fire_DirectGoal++;
    else if (power === PongModel.Models.LobbyParticipantSpecialPowerType.ice)
      this.ice_ScoredOpponentAffected++;
    else if (power === PongModel.Models.LobbyParticipantSpecialPowerType.spark)
      this.spark_ScoredOpponentAffected++;
    else if (power === PongModel.Models.LobbyParticipantSpecialPowerType.ghost)
      this.ghost_ScoredOpponentInvisible++;
  }

  public increaseGotHit(): void {
    this.hittenByPower++;
  }

  public iHitMyPower(opponent: Bar | undefined): void {
    this.shotHit++;
    if (opponent === undefined) return;
    opponent.stats.increaseGotHit();
  }

  public shotFired(): void {
    this.shotsFired++;
  }

  public gameOver(): void {
    this.powerAccuracy = (this.shotHit / this.shotsFired) * 100;
    this.manaSpent = this.shotsFired * this.powerCost;
  }

  public goalScored(): void {
    this.goalsScored++;
  }

  public exportStats(): string {
    return JSON.stringify({
      goalsScored: this.goalsScored,
      shotsFired: this.shotsFired,
      shotHit: this.shotHit,
      hittenByPower: this.hittenByPower,
      powerAccuracy: this.powerAccuracy,
      manaSpent: this.manaSpent,
      bubble_DirectGoal: this.bubble_DirectGoal,
      fire_DirectGoal: this.fire_DirectGoal,
      ice_ScoredOpponentAffected: this.ice_ScoredOpponentAffected,
      spark_ScoredOpponentAffected: this.spark_ScoredOpponentAffected,
      ghost_ScoredOpponentInvisible: this.ghost_ScoredOpponentInvisible,
    });
  }
}
