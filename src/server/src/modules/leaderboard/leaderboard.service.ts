import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import PongModel from '@typings/models/pong';
import LeaderboardModel from '@typings/models/leaderboard';
import { DbService } from '../db';
import UsersModel from '@typings/models/users';

@Injectable()
export class LeaderboardService {
  private static readonly K_FACTOR = 32;
  private static readonly C_FACTOR = 400;
  private static readonly MIN_ELO = 100;
  private positions: LeaderboardModel.Models.PositionsCacheEntry[] = [];
  constructor(
    private readonly usersService: UsersService,
    private readonly dbService: DbService,
  ) {
    this.dbService.leaderboard.getPositions().then((positions) => {
      this.positions = positions.map((position, idx) => ({
        userId: position.user!.id,
        position: idx + 1,
        elo: position.elo,
      }));
    });
  }

  private sortPositionsCache() {
    this.positions.sort((a, b) => b.elo - a.elo);
    this.positions.forEach((entry, idx) => (entry.position = idx + 1));
  }
  private updatePositionsCache(
    userId: number,
    elo: number,
    sort: boolean = true,
  ) {
    const position = this.positions.findIndex(
      (entry) => entry.userId === userId,
    );
    if (position === -1) this.positions.push({ userId, elo, position: 0 });
    else this.positions[position].elo = elo;
    if (sort) this.sortPositionsCache();
  }
  public getPositionForUser(userId: number): number {
    return (
      this.positions.find((entry) => entry.userId === userId)?.position ?? -1
    );
  }

  public async getLeaderboard(
    limit = 50,
    offset = 0,
  ): Promise<LeaderboardModel.Models.Leaderboard[]> {
    return await this.dbService.leaderboard.getAll({ limit, offset });
  }

  private async computeTeamAverageElo(
    team: PongModel.Models.IGameTeam,
  ): Promise<number> {
    if (!team.players.length) return 0;
    const users = await this.usersService.getMany(
      team.players
        .filter(
          (player) => player.type === UsersModel.Models.Types.User,
        )
        .map((player) => player.userId),
    );
    return users.reduce((acc, user) => acc + user.elo.rating, 0) / users.length;
  }
  private async updateTeamElo(
    team: PongModel.Models.ITeam,
    result: LeaderboardModel.Models.MatchResult,
    opponentElo: number,
  ): Promise<LeaderboardModel.Models.Reward[]> {
    let wonWeight: number;
    const rewards: LeaderboardModel.Models.Reward[] = [];
    switch (result) {
      case LeaderboardModel.Models.MatchResult.Win:
        wonWeight = 1;
        break;
      case LeaderboardModel.Models.MatchResult.Loss:
        wonWeight = 0;
        break;
      case LeaderboardModel.Models.MatchResult.Tie:
      default:
        wonWeight = 0.5;
        break;
    }
    const Qb = 10 ^ (opponentElo / LeaderboardService.C_FACTOR);
    for await (const player of team.players) {
      const user = await this.usersService.get(player.id);
      if (!user || user.type !== UsersModel.Models.Types.User) continue;
      const Qa = 10 ^ (user.elo.rating / LeaderboardService.C_FACTOR);
      const expectedToWin = Qa / (Qa + Qb);
      console.log(
        `${user.nickname}[${user.id}] wonWeight: ${wonWeight}, expectedToWin: ${expectedToWin}`,
      );

      const newElo = Math.round(
        user.elo.rating +
          LeaderboardService.K_FACTOR * (wonWeight - expectedToWin),
      );
      console.log(
        `${user.nickname}[${user.id}] newElo: ${newElo}, oldElo: ${user.elo.rating}`,
      );

      rewards.push({ userId: user.id, value: newElo - user.elo.rating });
      await user.elo.updateRating(
        Math.max(newElo, LeaderboardService.MIN_ELO),
        result,
        true,
      );
      this.updatePositionsCache(user.id, user.elo.rating, false);
    }
    return rewards;
  }
  public async computeEndGameElo(
    game: PongModel.Models.IGameConfig,
    lobby: PongModel.Models.ILobby,
  ): Promise<LeaderboardModel.Models.Reward[]> {
    console.log('lobby', lobby);
    if (lobby.queueType === PongModel.Models.LobbyType.Custom) return [];
    const [leftTeam, rightTeam] = lobby.teams;
    const [leftTeamElo, rightTeamElo] = await Promise.all(
      game.teams.map(this.computeTeamAverageElo.bind(this)),
    );
    console.log('teams', leftTeam, rightTeam);
    const rewards: LeaderboardModel.Models.Reward[] = [];
    let result: LeaderboardModel.Models.MatchResult =
      leftTeam.score === rightTeam.score
        ? LeaderboardModel.Models.MatchResult.Tie
        : leftTeam.score > rightTeam.score
        ? LeaderboardModel.Models.MatchResult.Win
        : LeaderboardModel.Models.MatchResult.Loss;

    rewards.push(...(await this.updateTeamElo(leftTeam, result, rightTeamElo)));
    result =
      result === LeaderboardModel.Models.MatchResult.Win
        ? LeaderboardModel.Models.MatchResult.Loss
        : result === LeaderboardModel.Models.MatchResult.Loss
        ? LeaderboardModel.Models.MatchResult.Win
        : LeaderboardModel.Models.MatchResult.Tie;
    rewards.push(...(await this.updateTeamElo(rightTeam, result, leftTeamElo)));
    const playersPositions = new Map<number, number>();
    leftTeam.players.concat(rightTeam.players).forEach((player) => {
      playersPositions.set(
        player.id,
        this.getPositionForUser(player.id),
      );
    });
    this.sortPositionsCache();
    const entries = playersPositions.entries();
    for await (const [userId, position] of entries) {
      const newPosition = this.getPositionForUser(userId);
      if (newPosition === position || newPosition !== 0) {
        continue;
      }
      // give achievement
      const user = await this.usersService.get(userId);
      if (!user) continue;
      const achievement = await user.achievements.get<{ count: number }>(
        'pong:rank:highest',
      );
      if (achievement.completed) continue;
      await achievement.update({ count: 1 });
    }
    return rewards;
  }
}
