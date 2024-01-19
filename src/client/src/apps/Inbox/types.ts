import { ColorPaletteProp, SvgIconProps } from '@mui/joy';
import NotificationsModel from '@typings/models/notifications';
import React from 'react';
import { CallbackInterface } from 'recoil';

export interface NotificationBuilderTemplateAction<
  T extends
    NotificationsModel.Models.INotification = NotificationsModel.Models.INotification,
> {
  id: string;
  label: React.ReactNode;
  onClick?: (
    notification: T,
    ctx: CallbackInterface
  ) => Promise<void>;
  show?: (notification: T) => boolean;
  Icon: React.ComponentType<SvgIconProps>;
  color?: ColorPaletteProp;
}

export type NotificationBuilderTemplate<
  T extends
    NotificationsModel.Models.INotification = NotificationsModel.Models.INotification,
> = {
  tag: NotificationsModel.Models.Tags | string;
  CustomRenderer?: React.ComponentType<T>;
  Icon: React.ReactNode | ((notification: T) => React.ReactNode);
  MessageRenderer?: React.ComponentType<T>;
  customActions: NotificationBuilderTemplateAction[];
  routeTo?: string;
  onClick?: (notification: T, ctx: CallbackInterface) => (void | Promise<void>);
};
