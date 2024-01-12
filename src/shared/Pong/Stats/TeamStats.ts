export class TeamStatistics {
  // this can also be in player if it's just one value

  private lastScored: number = 0;
  private currentGoalStreak: [number, number] = [0, 0];

  private longestGoalStreak: [number, number] = [0, 0]; // every time currentGoalStreak > longestGoalStreak, longestGoalStreak = currentGoalStreak

  constructor() {}

  public gameOver(): void {}

  public goalScored(teamWhoScored: number): void {
    if (this.lastScored === teamWhoScored) {
      this.currentGoalStreak[teamWhoScored]++;
      if (this.currentGoalStreak[teamWhoScored] > this.longestGoalStreak[teamWhoScored]) {
        this.longestGoalStreak[teamWhoScored] = this.currentGoalStreak[teamWhoScored];
      }
    } else {
      this.lastScored = teamWhoScored;
      this.currentGoalStreak[teamWhoScored] = 1;
    }
  }

  public exportStats(teamId: number): {} {
    if (teamId === 0) return {
      longestGoalStreak: this.longestGoalStreak[0],
    };
    else {
      return {
        longestGoalStreak: this.longestGoalStreak[1],
      };
    }
  }
}
