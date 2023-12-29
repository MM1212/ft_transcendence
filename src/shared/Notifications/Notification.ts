import NotificationsModel from '../../typings/models/notifications';
import { CacheObserver } from '../CacheObserver';

class SharedNotification
  extends CacheObserver<NotificationsModel.Models.INotification>
  implements NotificationsModel.Models.INotification
{
  constructor(data: NotificationsModel.Models.INotification) {
    super(data);
  }

  get public(): NotificationsModel.Models.INotification {
    return this.get() as NotificationsModel.Models.INotification;
  }

  get id(): number {
    return this.get('id');
  }
  get type() {
    return this.get('type');
  }
  get title() {
    return this.get('title');
  }
  get message() {
    return this.get('message');
  }
  set message(value: string) {
    this.set('message', value);
  }
  get tag() {
    return this.get('tag');
  }
  get data(): Record<string,unknown> {
    return this.get('data');
  }
  dataAs<T>(): T {
    return this.get('data') as T;
  }
  get createdAt(): number {
    return this.get('createdAt');
  }
  get userId(): number {
    return this.get('userId');
  }
  get lifetime(): number {
    return this.get('lifetime');
  }
  get read(): boolean {
    return this.get('read');
  }
  get expiresAt(): number {
    return this.createdAt + this.lifetime;
  }

  get dismissable(): boolean {
    return this.get('dismissable');
  }
  set dismissable(value: boolean) {
    this.set('dismissable', value);
  }
  get expired(): boolean {
    return this.lifetime !== 0 && this.expiresAt < Date.now();
  }

  get isPermanent(): boolean {
    return this.type === NotificationsModel.Models.Types.Permanent;
  }

  get isTemporary(): boolean {
    return this.type === NotificationsModel.Models.Types.Temporary;
  }
}

export default SharedNotification;