import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Users } from '.';
import { PrismaService } from '../../prisma';
import QuestsModel from '@typings/models/users/quests';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserQuests {
  constructor(@Inject(forwardRef(() => Users)) private readonly users: Users) {}

  private get prisma(): PrismaService {
    // @ts-expect-error impl
    return this.users.prisma;
  }

  public formatQuest<
    T extends QuestsModel.DTO.DB.IQuest | null,
    U = T extends null ? null : QuestsModel.Models.IUserQuest,
  >(quest: T): U {
    if (!quest) return null as unknown as U;
    const formatted: QuestsModel.Models.IUserQuest = {
      ...quest,
    } as unknown as QuestsModel.Models.IUserQuest;
    formatted.createdAt = quest.createdAt.getTime();
    formatted.updatedAt = quest.updatedAt.getTime();
    formatted.finishedAt = quest.finishedAt?.getTime();
    return formatted as U;
  }

  public async create(
    userId: number,
    tag: string,
    meta: Record<string, unknown> = {},
  ): Promise<QuestsModel.Models.IUserQuest> {
    return this.formatQuest(
      await this.prisma.quest.create({
        data: {
          userId,
          tag,
          meta: meta as any,
        },
      }),
    );
  }

  public async update(
    id: number,
    data: Prisma.XOR<Prisma.QuestUpdateInput, Prisma.QuestUncheckedUpdateInput>,
  ): Promise<QuestsModel.Models.IUserQuest> {
    return this.formatQuest(
      await this.prisma.quest.update({
        where: { id },
        data,
      }),
    );
  }
}
