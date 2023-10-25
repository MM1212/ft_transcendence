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
});

@Injectable()
export class Users {
  constructor(private readonly prisma: PrismaService) {}

  private formatUser<
    T extends UsersModel.DTO.DB.IUser | null,
    U = T extends null ? null : UsersModel.Models.IUser,
  >(user: T): U {
    if (!user) return null as unknown as U;
    const formatted: UsersModel.Models.IUser = {
      ...user,
    } as unknown as UsersModel.Models.IUser;
    formatted.friends = [
      ...user.friends.map((friend) => friend.id),
      ...user.friendOf.map((friend) => friend.id),
    ];
    delete (formatted as any).friendOf;
    formatted.chats = user.chats.map((chat) => chat.id);
    formatted.createdAt = user.createdAt.getTime();
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
    data: Partial<Omit<UsersModel.Models.IUserInfo, 'id' | 'createdAt'>>,
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
    }));
  }
}
