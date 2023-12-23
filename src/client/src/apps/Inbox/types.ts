import { ColorPaletteProp, SvgIconProps } from '@mui/joy';
import NotificationsModel from '@typings/models/notifications';
import React from 'react';
import { CallbackInterface } from 'recoil';

export interface NotificationBuilderTemplateAction {
  id: string;
  label: React.ReactNode;
  onClick: (
    notification: NotificationsModel.Models.INotification,
    ctx: CallbackInterface
  ) => void;
  Icon: React.ComponentType<SvgIconProps>;
  color?: ColorPaletteProp;
}

export type NotificationBuilderTemplate = {
  tag: NotificationsModel.Models.Tags | string;
  CustomRenderer?: React.ComponentType<NotificationsModel.Models.INotification>;
  Icon:
    | React.ReactNode
    | ((
        notification: NotificationsModel.Models.INotification
      ) => React.ReactNode);
  MessageRenderer?: React.ComponentType<
    NotificationsModel.Models.INotification
  >;
  customActions: NotificationBuilderTemplateAction[];
  routeTo?: string;
  onClick?: (
    notification: NotificationsModel.Models.INotification,
    ctx: CallbackInterface
  ) => void;
};
