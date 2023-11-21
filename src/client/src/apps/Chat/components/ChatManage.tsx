import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';
import {
  Dropdown,
  IconButton,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemProps,
} from '@mui/joy';
import React from 'react';
import { useSelectedChat } from '../hooks/useChat';
import AccountIcon from '@components/icons/AccountIcon';
import ChatsModel from '@typings/models/chat';
import AccountRemoveIcon from '@components/icons/AccountRemoveIcon';
import useFriend from '@apps/Friends/hooks/useFriend';
import { useFriends } from '@apps/Friends/hooks';
import AccountCancelIcon from '@components/icons/AccountCancelIcon';
import { useLocation } from 'wouter';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';

function MenuOption({
  icon: Icon,
  children,
  ...props
}: Omit<MenuItemProps, 'children'> & {
  icon?: React.ComponentType;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <MenuItem {...props}>
      {Icon && (
        <ListItemDecorator>
          <Icon />
        </ListItemDecorator>
      )}
      {children}
    </MenuItem>
  );
}

function DirectOptions({ self }: { self: ChatsModel.Models.IChatParticipant }) {
  const participants = useSelectedChat().useParticipants();
  const friends = useFriends();
  const [isFriend, friendId] = React.useMemo(() => {
    const other = participants.find((p) => p.id !== self.id);
    const friend = friends.find((friendId) => friendId === other?.userId);
    return [!!friend, friend ?? -1];
  }, [friends, participants, self.id]);
  const { remove, block } = useFriend(friendId);
  const [, navigate] = useLocation();
  const hookAction = React.useCallback(
    (action: () => void | Promise<void>, leave: boolean = false) =>
      async () => {
        await Promise.resolve(action());
        if (leave) navigate('/');
      },
    [navigate]
  );
  return (
    <>
      <MenuOption icon={AccountIcon}>Go to Profile</MenuOption>
      {isFriend ? (
        <MenuOption
          icon={AccountRemoveIcon}
          color="danger"
          onClick={hookAction(remove)}
        >
          Remove Friend
        </MenuOption>
      ) : (
        <MenuOption icon={AccountPlusIcon}>Send Friend Request</MenuOption>
      )}
      <MenuOption
        icon={AccountCancelIcon}
        color="danger"
        onClick={hookAction(block, true)}
      >
        Block
      </MenuOption>
    </>
  );
}

export default function ChatManageMenu() {
  const { useSelfParticipant, useType } = useSelectedChat();
  const self = useSelfParticipant();
  const type = useType();
  return React.useMemo(
    () => (
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          size="sm"
          variant="plain"
          color="neutral"
        >
          <DotsVerticalIcon />
        </MenuButton>
        <Menu placement="bottom-end" size="sm" sx={{ zIndex: 1300 }}>
          {type === ChatsModel.Models.ChatType.Direct && (
            <DirectOptions self={self} />
          )}
        </Menu>
      </Dropdown>
    ),
    [self, type]
  );
}
