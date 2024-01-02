import alerts from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import NotificationsModel from '@typings/models/notifications';
import {
  atom,
  atomFamily,
  selector,
  selectorFamily,
  useRecoilValue,
} from 'recoil';
import { NotificationBuilderTemplate } from '../types';
import BellIcon from '@components/icons/BellIcon';

const notificationsState = new (class NotificationsState {
  all = atom<NotificationsModel.Models.INotification[]>({
    key: 'notifications',
    default: selector({
      key: 'notifications/default',
      get: async () => {
        try {
          return await tunnel.get(NotificationsModel.Endpoints.Targets.GetAll);
        } catch (error) {
          alerts.error((error as Error).message);
          return [];
        }
      },
    }),
  });
  unreadCount = selector<number>({
    key: 'notifications/unreadCount',
    get: ({ get }) => {
      const notifications = get(this.all);
      return notifications.reduce((count, notification) => {
        return notification.read ? count : count + 1;
      }, 0);
    },
  });
  byTag = selectorFamily<
    NotificationsModel.Models.INotification[],
    NotificationsModel.Models.Tags | string
  >({
    key: 'notifications/byTag',
    get:
      (tag) =>
      ({ get }) => {
        const notifications = get(this.all);
        return notifications.filter((e) => e.tag === tag);
      },
  });

  public readonly DEFAULT_TEMPLATE_ICON = (<BellIcon />);
  templateCache = atomFamily<
    NotificationBuilderTemplate,
    NotificationsModel.Models.Tags | string
  >({
    key: 'notifications/templateCache',
    default: (tag) => ({
      tag,
      Icon: this.DEFAULT_TEMPLATE_ICON,
      customActions: [],
    }),
  });
})();

export const useNotificationsTemplate = (
  tag: NotificationsModel.Models.Tags | string
) => useRecoilValue(notificationsState.templateCache(tag));

export const useGetNotificationsByTag = <
  T extends NotificationsModel.Models.INotification,
>(
  tag: NotificationsModel.Models.Tags | string
) => useRecoilValue<T[]>(notificationsState.byTag(tag) as any);

export default notificationsState;
