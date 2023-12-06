import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/db/prisma';
import UsersModel from '@typings/models/users';
import { Prisma } from '@prisma/client';

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
});

@Injectable()
export class Users {
  constructor(private readonly prisma: PrismaService) {}

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
      })
    ).map<UsersModel.Models.IUserInfo>((user) => ({
      ...user,
      createdAt: user.createdAt.getTime(),
      status: UsersModel.Models.Status.Offline,
    }));
  }
  async exists(id: number): Promise<boolean> {
    return (
      (await this.prisma.user.count({
        where: { id },
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
        data,
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
    });
  }
  async delete(id: number): Promise<UsersModel.DTO.DB.IUserInfo> {
    return await this.prisma.user.delete({
      where: { id },
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
      })
    ).map<UsersModel.Models.IUserInfo>((user) => ({
      ...user,
      createdAt: user.createdAt.getTime(),
      status: UsersModel.Models.Status.Offline,
    }));
  }
}
