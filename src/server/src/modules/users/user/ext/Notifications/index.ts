import NotificationsModel from '@typings/models/notifications';
import User from '../..';
import UserExtBase from '../Base';
import SharedNotification from '@shared/Notifications/Notification';

class Notification extends SharedNotification {
  constructor(
    data: NotificationsModel.Models.INotification,
    private readonly ext: UserExtNotifications,
  ) {
    super(data);
  }

  private get helpers(): UserExtBase['helpers'] {
    // @ts-expect-error impl
    return this.ext.helpers;
  }

  get user(): User {
    return this.ext.user;
  }
  get notifications(): UserExtNotifications {
    return this.ext;
  }
  public sync(
    ...keys: (keyof NotificationsModel.DTO.UpdateNotification)[]
  ): void {
    const data: NotificationsModel.DTO.UpdateNotification = {
      id: this.id,
    };
    if (keys.length === 0) keys = Object.keys(this.public) as any;
    for (const key of keys) {
      if (key === 'deleted') data.deleted = true;
      else (data as any)[key] = this.get(key);
    }
    this.helpers.sseService.emitTo<NotificationsModel.Sse.UpdateNotificationEvent>(
      NotificationsModel.Sse.Events.UpdateNotification,
      this.user.id,
      data,
    );
  }

  public async markAsRead(sync: boolean = false): Promise<void> {
    if (this.read) return;
    if (this.isPermanent)
      await this.helpers.db.users.notifications.markAsRead(this.id);
    this.set('read', true);
    if (sync) {
      this.sync('read');
    }
  }
  public async markAsUnread(sync: boolean = false): Promise<void> {
    if (!this.read) return;
    if (this.isPermanent)
      await this.helpers.db.users.notifications.markAsUnread(this.id);
    this.set('read', false);
    if (sync) {
      this.sync('read');
    }
  }

  public async delete(sync: boolean = true): Promise<boolean> {
    try {
      if (this.isPermanent)
        await this.helpers.db.users.notifications.delete(this.id);
      this.user.set('notifications', (prev) =>
        prev.filter((n) => n.id !== this.id),
      );
      if (sync) {
        this.helpers.sseService.emitTo<NotificationsModel.Sse.DeleteNotificationsEvent>(
          NotificationsModel.Sse.Events.DeleteNotifications,
          this.user.id,
          {
            ids: [this.id],
          },
        );
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public async updateData<T>(
    data: T | ((prev: T) => T),
    sync: boolean = false,
  ): Promise<Notification> {
    if (typeof data === 'function') {
      data = (data as (prev: T) => T)(this.get('data') as T);
    }
    if (this.isPermanent)
      await this.helpers.db.users.notifications.update(this.id, {
        data: data as any,
      });
    this.set('data', data);
    if (sync) {
      this.sync('data');
    }
    return this;
  }
}

class UserExtNotifications extends UserExtBase {
  constructor(user: User) {
    super(user);
  }
  public get raw(): NotificationsModel.Models.INotification[] {
    return this.user.get('notifications');
  }

  public get all(): Notification[] {
    return this.raw.map((n) => new Notification(n, this));
  }

  public get unread(): Notification[] {
    return this.all.filter((n) => !n.read);
  }

  public get read(): Notification[] {
    return this.all.filter((n) => n.read);
  }

  public get count(): number {
    return this.raw.length;
  }

  public get(id: number): Notification | undefined {
    return this.all.find((n) => n.id === id);
  }
  public getByTag(tag: string): Notification[] {
    return this.all.filter((n) => n.tag === tag);
  }

  public async cleanup(sync: boolean = false): Promise<void> {
    const toDelete = this.all.filter((n) => n.expired);
    await this.helpers.db.users.notifications.deleteSome(
      toDelete.filter((n) => n.isPermanent).map((n) => n.id),
    );
    this.user.set('notifications', (prev) =>
      prev.filter((n) => !toDelete.some((_n) => _n.id === n.id)),
    );
    if (sync) {
      this.sync();
    }
  }
  public sync(): void {
    this.helpers.sseService.emitTo<NotificationsModel.Sse.SyncNotificationsEvent>(
      NotificationsModel.Sse.Events.SyncNotifications,
      this.user.id,
      this.raw,
    );
  }

  public async markAllAsRead(sync: boolean = false): Promise<void> {
    await this.helpers.db.users.notifications.markAllAsRead(this.user.id);
    this.user.set('notifications', (prev) =>
      prev.map((n) => ({ ...n, read: true })),
    );
    if (sync) {
      this.sync();
    }
  }
  public async deleteAll(sync: boolean = false): Promise<boolean> {
    try {
      await this.helpers.db.users.notifications.deleteAll(this.user.id);
      const ids = this.raw.map((n) => n.id);
      this.user.set('notifications', []);
      if (sync) {
        this.helpers.sseService.emitTo<NotificationsModel.Sse.DeleteNotificationsEvent>(
          NotificationsModel.Sse.Events.DeleteNotifications,
          this.user.id,
          {
            ids,
          },
        );
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public async create(
    data: NotificationsModel.DTO.CreateNotification,
    sync: boolean = false,
  ): Promise<Notification> {
    const notif =
      data.type === NotificationsModel.Models.Types.Permanent
        ? await this.helpers.db.users.notifications.create(this.user.id, {
            ...data,
            lifetime: data.lifetime ?? 0,
            data: data.data ?? {},
            tag: data.tag as string,
          })
        : ({
            id: Math.floor(Math.random() * 1000000000),
            ...data,
            lifetime: data.lifetime ?? 0,
            data: data.data ?? {},
            tag: data.tag as string,
            read: false,
            createdAt: Date.now(),
            userId: this.user.id,
          } satisfies NotificationsModel.Models.INotification);
    this.user.set('notifications', (prev) => [...prev, notif]);
    const notification = new Notification(notif, this);
    if (sync) {
      notification.sync();
    }
    return notification;
  }
}

export default UserExtNotifications;
