import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import NotificationsModel from '@typings/models/notifications';
import { Prisma } from '@prisma/client';
import { Users } from '.';

@Injectable()
export class UserNotifications {
  constructor(@Inject(forwardRef(() => Users)) private readonly users: Users) {}
  private get prisma(): PrismaService {
    // @ts-expect-error impl
    return this.users.prisma;
  }

  private formatNotification<
    T extends NotificationsModel.DTO.DB.Notification | null,
    U = T extends null ? null : NotificationsModel.Models.INotification,
  >(notification: T): U {
    if (!notification) return null as unknown as U;
    const formatted: NotificationsModel.Models.INotification = {
      ...notification,
    } as unknown as NotificationsModel.Models.INotification;
    formatted.createdAt = notification.createdAt.getTime();
    return formatted as unknown as U;
  }

  async getAll(
    userId: number,
  ): Promise<NotificationsModel.Models.INotification[]> {
    return (
      await this.prisma.notification.findMany({
        where: {
          userId,
        },
      })
    ).map(this.formatNotification);
  }

  async create(
    userId: number,
    notification: NotificationsModel.DTO.DB.CreateNotification,
  ): Promise<NotificationsModel.Models.INotification> {
    return this.formatNotification(
      await this.prisma.notification.create({
        data: {
          ...notification,
          userId,
        },
      }),
    );
  }

  async markAsRead(id: number): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: {
        read: true,
      },
    });
  }
  async markAsUnread(id: number): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: {
        read: false,
      },
    });
  }
  async markAllAsRead(userId: number): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId },
      data: {
        read: true,
      },
    });
  }
  async update(
    id: number,
    data: Prisma.XOR<
      Prisma.NotificationUpdateInput,
      Prisma.NotificationUncheckedUpdateInput
    >,
  ): Promise<NotificationsModel.Models.INotification> {
    return this.formatNotification(
      await this.prisma.notification.update({
        where: { id },
        data,
      }),
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }
  async deleteAll(userId: number): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
  async deleteSome(ids: number[]): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
