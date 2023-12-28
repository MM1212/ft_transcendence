import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import NotificationsModel from '@typings/models/notifications';
import React from 'react';
import { useRecoilCallback } from 'recoil';
import notificationsState from '..';

const useNotificationActions = (id: number) => {
  const [loading, setLoading] = React.useState(false);
  const changeReadState = useRecoilCallback(
    (ctx) =>
      async (read: boolean = true) => {
        try {
          setLoading(true);
          const notification = (
            await ctx.snapshot.getPromise(notificationsState.all)
          ).find((notif) => notif.id === id);
          if (!notification) {
            throw new Error('Notification not found');
          }
          if (notification.read === read) {
            setLoading(false);
            return;
          }
          await tunnel.put(
            NotificationsModel.Endpoints.Targets.MarkAsRead,
            {
              read,
            },
            {
              notifId: id,
            }
          );
          ctx.set(notificationsState.all, (prev) =>
            prev.map((notif) =>
              notif.id === id
                ? {
                    ...notif,
                    read,
                  }
                : notif
            )
          );
        } catch (e) {
          notifications.error(
            'Failed to update notification',
            (e as Error).message
          );
        } finally {
          setLoading(false);
        }
      },
    [id]
  );

  const markAsRead = React.useCallback(
    () => changeReadState(true),
    [changeReadState]
  );
  const markAsUnread = React.useCallback(
    () => changeReadState(false),
    [changeReadState]
  );

  const performAction = React.useCallback(
    async (action: string, params: Record<string, unknown> = {}) => {
      try {
        setLoading(true);
        await tunnel.post(
          NotificationsModel.Endpoints.Targets.DoAction,
          params,
          {
            notifId: id,
            action,
          }
        );
      } catch (e) {
        notifications.error(
          'Failed to perform action on notification',
          (e as Error).message
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  const dismiss = React.useCallback(
    () => performAction('__dismiss'),
    [performAction]
  );

  return {
    loading,
    changeReadState,
    markAsRead,
    markAsUnread,
    dismiss,
    performAction,
  };
};

export default useNotificationActions;
