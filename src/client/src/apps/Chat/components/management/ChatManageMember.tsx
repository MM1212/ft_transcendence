import { useSelectedChat } from '@apps/Chat/hooks/useChat';
import useFriend from '@apps/Friends/hooks/useFriend';
import AccountCancelIcon from '@components/icons/AccountCancelIcon';
import AccountIcon from '@components/icons/AccountIcon';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import CloseOctagonOutlineIcon from '@components/icons/CloseOctagonOutlineIcon';
import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';
import MessageIcon from '@components/icons/MessageIcon';
import MenuOption from '@components/menu/MenuOption';
import {
  Divider,
  Dropdown,
  IconButton,
  IconButtonProps,
  Menu,
  MenuButton,
} from '@mui/joy';
import ChatsModel from '@typings/models/chat';
import UsersModel from '@typings/models/users';
import React from 'react';
import { ChatMemberProps } from './ChatMembers';
import TimelapseIcon from '@components/icons/TimelapseIcon';
import OctagonIcon from '@components/icons/OctagonIcon';
import HandExtendedIcon from '@components/icons/HandExtendedIcon';
import useChatManageActions from '@apps/Chat/hooks/useChatManageActions';
import ShieldIcon from '@components/icons/ShieldIcon';
import KarateIcon from '@components/icons/KarateIcon';

const Roles = ChatsModel.Models.ChatParticipantRole;

interface Props
  extends Omit<ChatMemberProps, 'manage' | 'isSelf' | 'selfRole'> {
  role: ChatsModel.Models.ChatParticipantRole;
  closeAndRun: (callback: () => any) => () => void;
}

function AdminOptions({
  user,
  participant,
  role,
  closeAndRun,
}: Props): JSX.Element {
  const { useIsParticipantMutedComputed } = useSelectedChat();
  const isMutedData = useIsParticipantMutedComputed(participant.id);
  const isMember = participant.role === Roles.Member;
  const isAdmin = participant.role === Roles.Admin;
  const isBanned = participant.role === Roles.Banned;
  const left = participant.role === Roles.Left;
  const isSelfOwner = role === Roles.Owner;
  const notIn = !isMember && !isAdmin && participant.role !== Roles.Owner;
  const {
    toggleAdmin,
    kick,
    unmute,
    ban,
    unban,
    transferOwnership,
    openMuteModal,
  } = useChatManageActions();
  return React.useMemo(
    () => (
      <>
        {isSelfOwner && !notIn && (
          <MenuOption
            icon={isAdmin ? OctagonIcon : ShieldIcon}
            color="warning"
            onClick={() => toggleAdmin(participant.id, !isAdmin)}
          >
            {isAdmin ? 'Demote' : 'Promote'}
          </MenuOption>
        )}
        {isSelfOwner && !notIn && (
          <MenuOption
            icon={HandExtendedIcon}
            color="warning"
            onClick={closeAndRun(() => transferOwnership(participant.id))}
          >
            Transfer Ownership
          </MenuOption>
        )}
        {(isMember || isSelfOwner) && (
          <>
            {!isBanned && !left && (
              <>
                <MenuOption
                  icon={TimelapseIcon}
                  color="danger"
                  onClick={() =>
                    isMutedData.is
                      ? unmute(participant.id)
                      : openMuteModal(user, participant.id)
                  }
                >
                  {isMutedData.is ? 'Unmute' : 'Mute'}
                </MenuOption>
                <MenuOption
                  icon={KarateIcon}
                  color="danger"
                  onClick={() => kick(participant.id)}
                >
                  Kick
                </MenuOption>
              </>
            )}
            <MenuOption
              icon={CloseOctagonOutlineIcon}
              color="danger"
              onClick={() =>
                isBanned ? unban(participant.id) : ban(participant.id)
              }
            >
              {isBanned ? 'Unban' : 'Ban'}
            </MenuOption>
          </>
        )}
      </>
    ),
    [
      isSelfOwner,
      notIn,
      isAdmin,
      closeAndRun,
      isMember,
      isBanned,
      left,
      isMutedData.is,
      toggleAdmin,
      participant.id,
      transferOwnership,
      unmute,
      openMuteModal,
      user,
      kick,
      unban,
      ban,
    ]
  );
}

export default function ChatManageMember({
  disabled = false,
  participant,
  user,
  role,
  closeAndRun,
  ...props
}: {
  disabled?: boolean;
  participant: ChatsModel.Models.IChatParticipant;
  user: UsersModel.Models.IUserInfo;
  role: ChatsModel.Models.ChatParticipantRole;
  closeAndRun: (callback: () => any) => () => void;
} & IconButtonProps): JSX.Element {
  const {
    useIsBlocked,
    block,
    unblock,
    useIsFriend,
    goToMessages,
    goToProfile,
  } = useFriend(user.id);
  const isBlocked = useIsBlocked();
  const isFriend = useIsFriend();
  return React.useMemo(
    () => (
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          disabled={disabled}
          slotProps={{
            root: {
              size: 'sm',
              sx: {
                borderRadius: 'sm',
              },
              ...props,
            },
          }}
        >
          <DotsVerticalIcon />
        </MenuButton>
        <Menu placement="right-start" size="sm" sx={{ zIndex: 1300 }}>
          <MenuOption icon={AccountIcon} onClick={closeAndRun(goToProfile)}>
            Go To Profile
          </MenuOption>
          <MenuOption icon={MessageIcon} onClick={closeAndRun(goToMessages)}>
            Message
          </MenuOption>
          {!isFriend && !isBlocked && (
            <MenuOption icon={AccountPlusIcon}>Send Friend Request</MenuOption>
          )}
          <MenuOption
            icon={isBlocked ? CloseOctagonOutlineIcon : AccountCancelIcon}
            color="danger"
            onClick={isBlocked ? unblock : block}
          >
            {isBlocked ? 'Unblock' : 'Block'}
          </MenuOption>
          {role !== Roles.Member && (
            <>
              <Divider />
              <AdminOptions
                closeAndRun={closeAndRun}
                participant={participant}
                user={user}
                role={role}
              />
            </>
          )}
        </Menu>
      </Dropdown>
    ),
    [
      disabled,
      props,
      closeAndRun,
      goToProfile,
      goToMessages,
      isFriend,
      isBlocked,
      unblock,
      block,
      role,
      participant,
      user,
    ]
  );
}
