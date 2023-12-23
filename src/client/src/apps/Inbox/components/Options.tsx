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
import CloseIcon from '@components/icons/CloseIcon';

export default function NotificationOptions(
  props: NotificationsModel.Models.INotification
): JSX.Element {
  const template = useNotificationsTemplate(props.tag);
  const onActionClick = useRecoilCallback(
    (ctx) => (action: NotificationBuilderTemplateAction) => {
      action.onClick(props, ctx);
    },
    [props]
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
                mt: 2.5
              }
            },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DotsVerticalIcon />
        </MenuButton>
      </Tooltip>
      <Menu>
        {template.customActions.map((action) => (
          <MenuOption
            key={action.id}
            icon={action.Icon}
            onClick={() => onActionClick(action)}
            color={action.color}
          >
            {action.label}
          </MenuOption>
        ))}
        {template.customActions.length > 0 && <Divider />}
        {props.read ? (
          <MenuOption color="warning" icon={CloseIcon}>
            Mark as Unread
          </MenuOption>
        ) : (
          <MenuOption icon={CheckIcon}>Mark as Read</MenuOption>
        )}
        <MenuOption color="danger" icon={TrashCanIcon}>
          Delete
        </MenuOption>
      </Menu>
    </Dropdown>
  );
}
