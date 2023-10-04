import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/db/prisma';
import { IUser, IUserCreate } from '@typings/user';

@Injectable()
export class Users {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<IUser[]> {
    return await this.prisma.user.findMany();
  }
  async exists(id: number): Promise<boolean> {
    return !!(await this.prisma.user.findUnique({
      where: { id },
    }));
  }
  async get(id: number): Promise<IUser | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
  async getByStudentId(studentId: number): Promise<IUser | null> {
    return await this.prisma.user.findUnique({
      where: { studentId },
    });
  }
  async create(data: IUserCreate): Promise<IUser> {
    return await this.prisma.user.create({
      data,
    });
  }
  async update(
    id: number,
    data: Partial<Omit<IUser, 'id' | 'createdAt'>>,
  ): Promise<IUser> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }
  async delete(id: number): Promise<IUser> {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
