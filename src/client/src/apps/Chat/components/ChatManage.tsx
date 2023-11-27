import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';
import { Dropdown, IconButton, Menu, MenuButton } from '@mui/joy';
import React from 'react';
import { useSelectedChat } from '../hooks/useChat';
import AccountIcon from '@components/icons/AccountIcon';
import ChatsModel from '@typings/models/chat';
import AccountRemoveIcon from '@components/icons/AccountRemoveIcon';
import useFriend from '@apps/Friends/hooks/useFriend';
import { useBlocked, useFriends } from '@apps/Friends/hooks';
import AccountCancelIcon from '@components/icons/AccountCancelIcon';
import { useLocation } from 'wouter';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import CloseOctagonOutlineIcon from '@components/icons/CloseOctagonOutlineIcon';
import LogoutVariantIcon from '@components/icons/LogoutVariantIcon';
import AccountGroupIcon from '@components/icons/AccountGroupIcon';
import FolderCogIcon from '@components/icons/FolderCogIcon';
import FileDocumentEditIcon from '@components/icons/FileDocumentEditIcon';
import useChatManageActions from '../hooks/useChatManageActions';
import MenuOption from '@components/menu/MenuOption';
import NukeIcon from '@components/icons/NukeIcon';
import AccountMultiplePlusIcon from '@components/icons/AccountMultiplePlusIcon';

function DirectOptions({ self }: { self: ChatsModel.Models.IChatParticipant }) {
  const participants = useSelectedChat().useParticipants();
  const friends = useFriends();
  const blocked = useBlocked();
  const [isFriend, isBlocked, friendId] = React.useMemo(() => {
    const other = participants.find((p) => p.id !== self.id);
    const isFriend = friends.includes(other?.userId ?? -1);
    const isBlocked = blocked.includes(other?.userId ?? -1);
    return [!!isFriend, isBlocked, other?.userId ?? -1];
  }, [blocked, friends, participants, self.id]);
  const { remove, block, unblock, goToProfile, sendInviteFromDM } =
    useFriend(friendId);
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
      <MenuOption icon={AccountIcon} onClick={goToProfile}>
        Go to Profile
      </MenuOption>
      <MenuOption icon={AccountMultiplePlusIcon} onClick={sendInviteFromDM}>
        Invite to Group
      </MenuOption>
      {isFriend ? (
        <MenuOption
          icon={AccountRemoveIcon}
          color="danger"
          onClick={hookAction(remove)}
        >
          Remove Friend
        </MenuOption>
      ) : (
        <MenuOption icon={AccountPlusIcon} disabled={isBlocked}>
          Send Friend Request
        </MenuOption>
      )}
      <MenuOption
        icon={isBlocked ? CloseOctagonOutlineIcon : AccountCancelIcon}
        color="danger"
        onClick={hookAction(isBlocked ? unblock : block, false)}
      >
        {isBlocked ? 'Unblock' : 'Block'}
      </MenuOption>
    </>
  );
}

function GroupOptions({
  self,
  isPublic,
}: {
  self: ChatsModel.Models.IChatParticipant;
  isPublic: boolean;
}): JSX.Element {
  const isOwner = self.role === ChatsModel.Models.ChatParticipantRole.Owner;
  const isAdmin =
    self.role === ChatsModel.Models.ChatParticipantRole.Admin || isOwner;
  const { useModal, leave, nuke, sendInviteFromGroup } = useChatManageActions();
  const { open } = useModal();
  return (
    <>
      {(isPublic || isAdmin) && (
        <MenuOption
          icon={AccountMultiplePlusIcon}
          onClick={sendInviteFromGroup}
        >
          Send Invite Link
        </MenuOption>
      )}
      {isAdmin ? (
        <>
          <MenuOption icon={FileDocumentEditIcon}>Edit</MenuOption>
          <MenuOption icon={FolderCogIcon} onClick={() => open(true)}>
            Manage Members
          </MenuOption>
        </>
      ) : (
        <MenuOption icon={AccountGroupIcon} onClick={() => open()}>
          Members
        </MenuOption>
      )}
      <MenuOption
        icon={LogoutVariantIcon}
        color="warning"
        onClick={() => leave()}
      >
        Leave
      </MenuOption>
      {isOwner && (
        <MenuOption icon={NukeIcon} color="danger" onClick={nuke}>
          Delete
        </MenuOption>
      )}
    </>
  );
}

const ButtonIcon = React.memo(() => (
  <MenuButton
    slots={{ root: IconButton }}
    size="sm"
    variant="plain"
    color="neutral"
  >
    <DotsVerticalIcon />
  </MenuButton>
));

export default function ChatManageMenu() {
  const { useSelfParticipant, useSelf } = useSelectedChat();
  const self = useSelfParticipant();
  const { type, authorization } = useSelf();
  return React.useMemo(
    () => (
      <Dropdown>
        <ButtonIcon />
        <Menu placement="bottom-end" size="sm" sx={{ zIndex: 1300 }}>
          <React.Suspense fallback={<></>}>
            {type === ChatsModel.Models.ChatType.Direct && (
              <DirectOptions self={self} />
            )}
            {type === ChatsModel.Models.ChatType.Group && (
              <GroupOptions
                self={self}
                isPublic={authorization !== ChatsModel.Models.ChatAccess.Private}
              />
            )}
          </React.Suspense>
        </Menu>
      </Dropdown>
    ),
    [authorization, self, type]
  );
}
