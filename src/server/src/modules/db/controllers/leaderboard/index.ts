import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import LeaderboardModel from '@typings/models/leaderboard';
import type { Prisma } from '@prisma/client';
import UsersModel from '@typings/models/users';

@Injectable()
export class LeaderboardDbController {
  constructor(private readonly prisma: PrismaService) {}

  public formatLeaderboard<
    T extends LeaderboardModel.DTO.BD.Leaderboard | null,
    U = T extends null ? null : LeaderboardModel.Models.Leaderboard,
  >(leaderboard: T): U {
    if (!leaderboard) return null as unknown as U;
    const formatted: LeaderboardModel.Models.Leaderboard = {
      ...leaderboard,
    } as unknown as LeaderboardModel.Models.Leaderboard;
    formatted.createdAt = leaderboard.createdAt.getTime();
    formatted.updatedAt = leaderboard.updatedAt.getTime();
    formatted.userId = leaderboard.user!.id;
    delete (formatted as any).user;
    return formatted as U;
  }
  async getAll({ limit = 50, offset = 0 }: LeaderboardModel.DTO.BD.GetLimits) {
    return (
      await this.prisma.leaderboard.findMany({
        take: limit === -1 ? undefined : limit,
        skip: offset,
        orderBy: {
          elo: 'desc',
        },
        where: {
          OR: [{ wins: { gt: 0 } }, { losses: { gt: 0 } }],
          user: {
            type: UsersModel.Models.Types.User
          }
        },
        include: {
          user: {
            select: { id: true },
          },
        },
      })
    ).map(this.formatLeaderboard);
  }
  async getPositions() {
    return this.prisma.leaderboard.findMany({
      select: { user: { select: { id: true } }, elo: true},
      orderBy: { elo: 'desc' },
      where: {
        OR: [{ wins: { gt: 0 } }, { losses: { gt: 0 } }],
        user: {
          type: UsersModel.Models.Types.User
        }
      },
    });
  }
  async update(
    id: number,
    data: Prisma.XOR<
      Prisma.LeaderboardUpdateInput,
      Prisma.LeaderboardUncheckedUpdateInput
    >,
  ) {
    return this.formatLeaderboard(
      await this.prisma.leaderboard.update({
        where: { id },
        data,
        include: {
          user: {
            select: { id: true },
          },
        },
      }),
    );
  }
}
