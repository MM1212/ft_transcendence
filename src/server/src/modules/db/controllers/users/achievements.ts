import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Users } from '.';
import { PrismaService } from '../../prisma';
import AchievementsModel from '@typings/models/users/achievements';

@Injectable()
export class UserAchievements {
  constructor(@Inject(forwardRef(() => Users)) private readonly users: Users) { }

  private get prisma(): PrismaService {
    // @ts-expect-error impl
    return this.users.prisma;
  }

  public formatAchievement<
    T extends AchievementsModel.DTO.DB.IUserAchievement | null,
    U = T extends null ? null : AchievementsModel.Models.IUserAchievement,
  >(achievement: T): U {
    if (!achievement) return null as unknown as U;
    const formatted: AchievementsModel.Models.IUserAchievement = {
      ...achievement,
    } as unknown as AchievementsModel.Models.IUserAchievement;
    formatted.createdAt = achievement.createdAt.getTime();
    return formatted as U;
  }

  public async create(
    userId: number,
    tag: string,
  ): Promise<AchievementsModel.Models.IUserAchievement> {
    return this.formatAchievement(
      await this.prisma.achievement.create({
        data: {
          userId,
          tag,
        },
      }),
    );
  }

  public async delete(
    id: number,
  ): Promise<AchievementsModel.Models.IUserAchievement> {
    return this.formatAchievement(
      await this.prisma.achievement.delete({
        where: { id },
      }),
    );
  }
}
