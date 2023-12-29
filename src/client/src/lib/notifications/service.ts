import { useSseEvent } from '@hooks/sse';
import NotificationsModel from '@typings/models/notifications';
import React from 'react';
import notifications, { NotificationProps } from './hooks';

export const useAlertsService = () => {
  const onNewAlert = React.useCallback(
    (ev: NotificationsModel.Sse.SendAlertEvent) => {
      const { data } = ev;
      let color: typeof data.color | 'error' | 'default' | 'info' =
        data.color ?? 'default';
      switch (color) {
        case 'neutral':
          color = 'default';
          break;
        case 'danger':
          color = 'error';
          break;
        case 'primary':
          color = 'info';
          break;
      }
      notifications[color](data.title, data.message, {
        message: data.title ? undefined : data.message,
        title: data.title,
        description: data.title ? data.message : undefined,
        invertedColors: data.invertedColors,
        variant: data.variant,
        duration: data.duration ?? 5000,
      } as NotificationProps);
    },
    []
  );

  useSseEvent<NotificationsModel.Sse.SendAlertEvent>(
    NotificationsModel.Sse.Events.SendAlert,
    onNewAlert
  );
};
