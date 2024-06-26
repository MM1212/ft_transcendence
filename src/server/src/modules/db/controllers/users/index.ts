import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from '@/modules/db/prisma';
import UsersModel from '@typings/models/users';
import { Prisma } from '@prisma/client';
import { UserAchievements } from './achievements'; //new
import { UserInventory } from './inventory';
import { UserNotifications } from './notifications';

const USER_EXT_QUERY = Prisma.validator<Prisma.UserSelect>()({
  chats: {
    select: { id: true },
  },
  friends: {
    select: { id: true },
  },
  friendOf: {
    select: { id: true },
  },
  blocked: {
    select: { id: true },
  },
  character: true,
  achievements: true, //new
  inventory: true,
  notifications: true,
  leaderboard: true,
});

@Injectable()
export class Users {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserAchievements)) public readonly achievements: UserAchievements, //new
    @Inject(forwardRef(() => UserInventory))
    public readonly inventory: UserInventory,
    @Inject(forwardRef(() => UserNotifications))
    public readonly notifications: UserNotifications,
  ) {}

  public formatUser<
    T extends UsersModel.DTO.DB.IUser | null,
    U = T extends null ? null : UsersModel.Models.IUser,
  >(user: T): U {
    if (!user) return null as unknown as U;
    const formatted: UsersModel.Models.IUser = {
      ...user,
    } as unknown as UsersModel.Models.IUser;
    formatted.tfa = {
      enabled: user.tfaEnabled,
      secret: user.tfaSecret ?? undefined,
    };
    if (formatted.studentId === null) delete formatted.studentId;
    delete (formatted as any).tfaEnabled;
    delete (formatted as any).tfaSecret;
    formatted.friends = [
      ...user.friends.map((friend) => friend.id),
      ...user.friendOf.map((friend) => friend.id),
    ];
    delete (formatted as any).friendOf;
    formatted.blocked = [...user.blocked.map((blocked) => blocked.id)];
    delete (formatted as any).blockedBy;
    formatted.chats = user.chats.map((chat) => chat.id);
    formatted.createdAt = user.createdAt.getTime();
    formatted.status = UsersModel.Models.Status.Offline;
    formatted.connected = false;
    formatted.achievements = user.achievements.map((achievement) => ({ //achievement
      ...achievement,
      createdAt: achievement.createdAt.getTime(),
      updatedAt: achievement.updatedAt.getTime(),
      unlockedAt: achievement.unlockedAt?.getTime() ?? null,
    }));
    formatted.inventory = user.inventory.map((item) => ({
      ...item,
      createdAt: item.createdAt.getTime(),
    }));
    formatted.notifications = user.notifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt.getTime(),
    }));
    delete (formatted as any).leaderboardId;
    return formatted as unknown as U;
  }

  async getAll({
    limit,
    offset,
  }: UsersModel.DTO.DB.GetLimits): Promise<UsersModel.Models.IUserInfo[]> {
    return (
      await this.prisma.user.findMany({
        skip: offset,
        take: limit,
        include: {
          leaderboard: {
            select: {
              elo: true
            }
          },  
        },
      })
    ).map<UsersModel.Models.IUserInfo>((user) => ({
      ...user,
      createdAt: user.createdAt.getTime(),
      status: UsersModel.Models.Status.Offline,
      leaderboardId: undefined
    }));
  }
  async exists(id: number | string): Promise<boolean> {
    return (
      (await this.prisma.user.count({
        where: {
          ...(typeof id === 'number' && { id }),
          ...(typeof id === 'string' && { nickname: id }),
        },
      })) === 1
    );
  }
  async get(id: number): Promise<UsersModel.Models.IUser | null> {
    return this.formatUser(
      await this.prisma.user.findUnique({
        where: { id },
        include: USER_EXT_QUERY,
      }),
    );
  }
  async getMany(ids: number[]): Promise<UsersModel.Models.IUser[]> {
    return (
      await this.prisma.user.findMany({
        where: { id: { in: ids } },
        include: USER_EXT_QUERY,
      })
    ).map(this.formatUser);
  }
  async getByStudentId(
    studentId: number,
  ): Promise<UsersModel.Models.IUser | null> {
    return this.formatUser(
      await this.prisma.user.findUnique({
        where: { studentId },
        include: USER_EXT_QUERY,
      }),
    );
  }
  async getByNickname(
    nickname: string,
  ): Promise<UsersModel.Models.IUser | null> {
    return this.formatUser(
      await this.prisma.user.findUnique({
        where: { nickname },
        include: USER_EXT_QUERY,
      }),
    );
  }
  async create(
    data: UsersModel.DTO.DB.IUserCreate,
  ): Promise<UsersModel.Models.IUser> {
    return this.formatUser(
      await this.prisma.user.create({
        data: {
          ...data,
          character: {
            create: {},
          },
          inventory: {
            createMany: {
              data: [...(data.inventory ?? [])],
            },
          },
          leaderboard: {
            create: {}
          },
        },
        include: USER_EXT_QUERY,
      }),
    );
  }
  async update(
    id: number,
    data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>,
  ): Promise<UsersModel.DTO.DB.IUserInfo> {
    return await this.prisma.user.update({
      where: { id },
      data,
      include: {
        leaderboard: true,
      },
    });
  }
  async delete(id: number): Promise<UsersModel.DTO.DB.IUserInfo> {
    return await this.prisma.user.delete({
      where: { id },
      include: {
        leaderboard: true,
      },
    });
  }
  async search(
    query: string,
    filter: UsersModel.DTO.DB.GetLimits,
  ): Promise<UsersModel.Models.IUserInfo[]> {
    return (
      await this.prisma.user.findMany({
        where: {
          nickname: {
            contains: query,
            mode: 'insensitive',
          },
        },
        skip: filter.offset,
        take: filter.limit,
        include: {
          leaderboard: true,
        },
      })
    ).map<UsersModel.Models.IUserInfo>((user) => ({
      id: user.id,
      type: user.type,
      nickname: user.nickname,
      avatar: user.avatar,
      credits: user.credits,
      firstLogin: user.firstLogin,
      createdAt: user.createdAt.getTime(),
      status: UsersModel.Models.Status.Offline,
      leaderboard: {
        elo: user.leaderboard.elo,
      },

    }));
  }
}
