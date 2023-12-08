import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import NotificationsModel from '@typings/models/notifications';

@Injectable()
export class Notifications {
  constructor(private readonly prisma: PrismaService) {}

  private formatNotification<
    T extends NotificationsModel.DTO.DB.Notification | null,
    U = T extends null ? null : NotificationsModel.Models.Notification,
  >(notification: T): U {
    if (!notification) return null as unknown as U;
    const formatted: NotificationsModel.Models.Notification = {
      ...notification,
    } as unknown as NotificationsModel.Models.Notification;
    formatted.createdAt = notification.createdAt.getTime();
    return formatted as unknown as U;
  }

  async getAll({
    limit,
  }: {
    limit?: number;
  }): Promise<NotificationsModel.Models.Notification[]> {
    return (
      await this.prisma.notification.findMany({
        take: limit,
      })
    ).map(this.formatNotification);
  }
  async getOne(id: number): Promise<NotificationsModel.Models.Notification> {
    return this.formatNotification(
      await this.prisma.notification.findUnique({
        where: { id },
      }),
    );
  }
  async deleteOne(id: number): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }
  async deleteAll(): Promise<void> {
    await this.prisma.notification.deleteMany({});
  }

  async markAllAsRead(): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  }
}
