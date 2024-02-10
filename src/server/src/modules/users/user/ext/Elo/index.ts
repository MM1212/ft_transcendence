import LeaderboardModel from '@typings/models/leaderboard';
import type User from '../..';
import UserExtBase from '../Base';

export class UserExtElo extends UserExtBase {
  constructor(user: User) {
    super(user);
  }

  public get leaderboard(): LeaderboardModel.Models.Leaderboard {
    return this.user.get('leaderboard');
  }

  private get id(): number {
    return this.leaderboard.id;
  }

  public get rating(): number {
    return this.leaderboard.elo;
  }
  public get gamesPlayed(): number {
    return this.leaderboard.wins + this.leaderboard.losses;
  }
  public get wins(): number {
    return this.leaderboard.wins;
  }
  public get losses(): number {
    return this.leaderboard.losses;
  }
  public get ties(): number {
    return this.leaderboard.ties;
  }
  public get winRate(): number {
    return this.gamesPlayed === 0 ? 0 : this.wins / this.gamesPlayed;
  }
  /*
   * Absolute value, if you want the raw value use rawStreak instead
   * This should be used with `isWinStreaking` or `isLoseStreaking` to determine if the streak is a win or loss streak
   *  */
  public get streak(): number {
    return Math.abs(this.leaderboard.streak);
  }
  public get rawStreak(): number {
    return this.leaderboard.streak;
  }

  public get isWinStreaking(): boolean {
    return this.leaderboard.streak > 0;
  }
  public get isLoseStreaking(): boolean {
    return this.leaderboard.streak < 0;
  }
  public get isStreaking(): boolean {
    return this.leaderboard.streak !== 0;
  }

  public async updateRating(
    value: number,
    result: LeaderboardModel.Models.MatchResult,
    sync: boolean = true,
  ): Promise<void> {
    const raw: Pick<
      LeaderboardModel.Models.Leaderboard,
      'wins' | 'losses' | 'ties' | 'elo' | 'streak'
    > = {
      wins: this.wins,
      losses: this.losses,
      ties: this.ties,
      elo: value,
      streak: this.rawStreak,
    };
    raw.elo = value;
    switch (result) {
      case LeaderboardModel.Models.MatchResult.Win:
        raw.wins++;
        break;
      case LeaderboardModel.Models.MatchResult.Loss:
        raw.losses++;
        break;
      case LeaderboardModel.Models.MatchResult.Tie:
        raw.ties++;
        break;
    }
    if (result !== LeaderboardModel.Models.MatchResult.Tie) {
      const won = result === LeaderboardModel.Models.MatchResult.Win;
      if (this.isWinStreaking !== won) raw.streak = won ? 1 : -1;
      else raw.streak += won ? 1 : -1;
    } else raw.streak = 0;
    console.log('Updating rating', value, raw);
    const resp = await this.helpers.db.leaderboard.update(this.id, raw);
    if (!resp) throw new Error('Failed to update rating');
    this.user.set('leaderboard', resp);
    if (sync) {
      this.user.propagate('leaderboard');
    }
  }

  public async sync(): Promise<void> {
    this.user.propagate('leaderboard');
  }

  public async resetRating(sync: boolean = true): Promise<void> {
    const resp = await this.helpers.db.leaderboard.update(this.user.id, {
      elo: 1000,
      wins: 0,
      losses: 0,
      ties: 0,
      streak: 0,
    });
    if (!resp) throw new Error('Failed to reset rating');
    this.user.set('leaderboard', resp);
    if (sync) {
      this.user.propagate('leaderboard');
    }
  }
}
