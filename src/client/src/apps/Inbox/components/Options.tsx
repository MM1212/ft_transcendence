import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';
import TrashCanIcon from '@components/icons/TrashCanIcon';
import MenuOption from '@components/menu/MenuOption';
import {
  Tooltip,
  IconButton,
  Dropdown,
  Menu,
  MenuButton,
  Divider,
} from '@mui/joy';
import NotificationsModel from '@typings/models/notifications';
import { useNotificationsTemplate } from '../state';
import { NotificationBuilderTemplateAction } from '../types';
import { useRecoilCallback } from 'recoil';
import CheckIcon from '@components/icons/CheckIcon';
import useNotificationActions from '../state/hooks/useNotificationActions';
import React from 'react';
import BellOffIcon from '@components/icons/BellOffIcon';

export default function NotificationOptions(
  props: NotificationsModel.Models.INotification
): JSX.Element {
  const { customActions } = useNotificationsTemplate(props.tag);
  const { performAction, dismiss, markAsRead, markAsUnread } =
    useNotificationActions(props.id);
  const stopPropagation =
    (cb?: () => void) => (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      cb?.();
    };
  const onActionClick = useRecoilCallback(
    (ctx) => async (action: NotificationBuilderTemplateAction) => {
      if (action.onClick) await Promise.resolve(action.onClick(props, ctx));
      else await performAction(action.id);
    },
    [performAction, props]
  );
  return (
    <Dropdown>
      <Tooltip title="More Options">
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{
            root: {
              size: 'sm',
              variant: 'outlined',
              color: 'neutral',
              sx: {
                mt: 2.5,
              },
            },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DotsVerticalIcon />
        </MenuButton>
      </Tooltip>
      <Menu>
        {customActions.map(
          (action) =>
            (action.show?.(props) ?? true) && (
              <MenuOption
                key={action.id}
                icon={action.Icon}
                onClick={stopPropagation(() => onActionClick(action))}
                color={action.color}
              >
                {action.label}
              </MenuOption>
            )
        )}
        {customActions.length > 0 && <Divider />}
        {props.read ? (
          <MenuOption
            color="primary"
            icon={BellOffIcon}
            onClick={stopPropagation(markAsUnread)}
          >
            Mark as Unread
          </MenuOption>
        ) : (
          <MenuOption icon={CheckIcon} onClick={stopPropagation(markAsRead)}>
            Mark as Read
          </MenuOption>
        )}
        {props.dismissable && (
          <MenuOption
            color="danger"
            icon={TrashCanIcon}
            onClick={stopPropagation(dismiss)}
          >
            Dismiss
          </MenuOption>
        )}
      </Menu>
    </Dropdown>
  );
}
