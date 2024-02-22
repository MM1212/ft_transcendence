import { PrismaService } from '@/modules/db/prisma';
import { Injectable } from '@nestjs/common';
import PongHistoryModel from '@typings/models/pong/history';

@Injectable()
export class PongHistory {
  constructor(private readonly prisma: PrismaService) {}

  public formatPlayer<
    T extends PongHistoryModel.DTO.DB.Player | null,
    U = T extends null ? null : PongHistoryModel.Models.Player,
  >(player: T): U {
    if (!player) return null as unknown as U;
    const formatted: PongHistoryModel.Models.Player = {
      ...player,
    } as unknown as PongHistoryModel.Models.Player;
    formatted.createdAt = player.createdAt.getTime();
    return formatted as unknown as U;
  }

  public formatTeam<
    T extends PongHistoryModel.DTO.DB.Team | null,
    U = T extends null ? null : PongHistoryModel.Models.Team,
  >(team: T): U {
    if (!team) return null as unknown as U;
    const formatted: PongHistoryModel.Models.Team = {
      ...team,
    } as unknown as PongHistoryModel.Models.Team;
    formatted.createdAt = team.createdAt.getTime();
    formatted.players = team.players.map(this.formatPlayer.bind(this));
    return formatted as unknown as U;
  }

  public formatMatch<
    T extends PongHistoryModel.DTO.DB.Match | null,
    U = T extends null ? null : PongHistoryModel.Models.Match,
  >(match: T): U {
    if (!match) return null as unknown as U;
    const formatted: PongHistoryModel.Models.Match = {
      ...match,
    } as unknown as PongHistoryModel.Models.Match;
    formatted.createdAt = match.createdAt.getTime();
    formatted.teams = match.teams.map(this.formatTeam.bind(this));
    return formatted as unknown as U;
  }

  async getAllFromUserId(
    id: number,
    filter: {
      skip?: number;
      take?: number;
      cursor?: number;
    },
  ): Promise<PongHistoryModel.Models.Match[]> {
    return (
      await this.prisma.matchHistory.findMany({
        where: {
          teams: {
            some: {
              players: {
                some: {
                  userId: id,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: filter.skip,
        take: filter.take,
        cursor: filter.cursor
          ? {
              id: filter.cursor,
            }
          : undefined,
        include: {
          teams: {
            include: {
              players: true,
            },
          },
        },
      })
    ).map(this.formatMatch.bind(this));
  }
  public async get(id: number): Promise<PongHistoryModel.Models.Match> {
    return this.formatMatch(
      await this.prisma.matchHistory.findUnique({
        where: {
          id,
        },
        include: {
          teams: {
            include: {
              players: true,
            },
          },
        },
      }),
    );
  }
  public async create(
    matchData: PongHistoryModel.DTO.DB.CreateMatch,
  ): Promise<PongHistoryModel.Models.Match> {
    const match = await this.prisma.matchHistory.create({
      data: {
        ...matchData,
        teams: {
          createMany: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            data: matchData.teams.map(({ players: _, ...team }) => ({
              ...team,
              stats: team.stats as any,
            })),
          },
        },
        stats: matchData.stats as any,
      },
      select: {
        teams: {
          select: { id: true },
        },
        id: true,
      },
    });
    const playersToInsert = matchData.teams[0].players.concat(
      matchData.teams[1].players,
    );
    await this.prisma.matchHistoryPlayer.createMany({
      data: playersToInsert.map((player) => ({
        ...player,
        stats: player.stats as any,
        gear: player.gear as any,
        teamId: match.teams[player.teamId].id,
      })),
    });
    return await this.get(match.id);
  }
}
