import { useSseEvent } from '@hooks/sse';
import NotificationsModel from '@typings/models/notifications';
import React from 'react';
import notifications, { NotificationProps } from './hooks';

export const useNotificationsService = () => {
  const onNewAlert = React.useCallback(
    (ev: NotificationsModel.Sse.SendAlertEvent) => {
      const { data } = ev;
      notifications.create({
        message: data.title ? undefined : data.message,
        title: data.title,
        description: data.title ? data.message : undefined,
        color: data.color,
        invertedColors: data.invertedColors,
        variant: data.variant,
        duration: data.duration ?? 5000,
      }  as NotificationProps);
    },
    []
  );

  useSseEvent<NotificationsModel.Sse.SendAlertEvent>(
    NotificationsModel.Sse.Events.SendAlert,
    onNewAlert
  );
};
