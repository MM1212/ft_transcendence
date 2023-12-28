import NotificationsModel from '@typings/models/notifications';
import { useRecoilCallback } from 'recoil';
import notificationsState from '.';
import { useSseEvent } from '@hooks/sse';

const useNotificationsService = () => {
  const newNotificationEvent = useRecoilCallback(
    (ctx) => async (ev: NotificationsModel.Sse.NewNotificationEvent) => {
      const { isActive } = ctx.snapshot.getInfo_UNSTABLE(
        notificationsState.all
      );
      if (!isActive) return;
      ctx.set(notificationsState.all, (prev) => [...prev, ev.data]);
    },
    []
  );

  const updateNotificationEvent = useRecoilCallback(
    (ctx) => async (ev: NotificationsModel.Sse.UpdateNotificationEvent) => {
      const { data } = ev;
      const { isActive } = ctx.snapshot.getInfo_UNSTABLE(
        notificationsState.all
      );
      if (!isActive) return;
      const notifications = [
        ...(await ctx.snapshot.getPromise(notificationsState.all)),
      ];
      const index = notifications.findIndex((i) => i.id === data.id);
      if (index === -1) return;
      notifications[index] = {
        ...notifications[index],
        ...data,
      };
      ctx.set(notificationsState.all, notifications);
    },
    []
  );

  const syncNotificationsEvent = useRecoilCallback(
    (ctx) => async (ev: NotificationsModel.Sse.SyncNotificationsEvent) => {
      const { isActive } = ctx.snapshot.getInfo_UNSTABLE(
        notificationsState.all
      );
      if (!isActive) return;
      ctx.set(notificationsState.all, ev.data);
    },
    []
  );

  const deleteNotificationsEvent = useRecoilCallback(
    (ctx) => async (ev: NotificationsModel.Sse.DeleteNotificationsEvent) => {
      const { isActive } = ctx.snapshot.getInfo_UNSTABLE(
        notificationsState.all
      );
      if (!isActive) return;
      ctx.set(notificationsState.all, (prev) =>
        prev.filter((i) => !ev.data.ids.includes(i.id))
      );
    },
    []
  );

  useSseEvent<NotificationsModel.Sse.NewNotificationEvent>(
    NotificationsModel.Sse.Events.NewNotification,
    newNotificationEvent
  );
  useSseEvent<NotificationsModel.Sse.UpdateNotificationEvent>(
    NotificationsModel.Sse.Events.UpdateNotification,
    updateNotificationEvent
  );
  useSseEvent<NotificationsModel.Sse.SyncNotificationsEvent>(
    NotificationsModel.Sse.Events.SyncNotifications,
    syncNotificationsEvent
  );
  useSseEvent<NotificationsModel.Sse.DeleteNotificationsEvent>(
    NotificationsModel.Sse.Events.DeleteNotifications,
    deleteNotificationsEvent
  );
};

export default useNotificationsService;