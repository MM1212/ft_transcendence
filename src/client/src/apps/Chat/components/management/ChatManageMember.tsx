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
import React from 'react';
import { ChatMemberProps } from './ChatMembers';
import TimelapseIcon from '@components/icons/TimelapseIcon';
import OctagonIcon from '@components/icons/OctagonIcon';
import HandExtendedIcon from '@components/icons/HandExtendedIcon';
import useChatManageActions from '@apps/Chat/hooks/useChatManageActions';
import ShieldIcon from '@components/icons/ShieldIcon';
import KarateIcon from '@components/icons/KarateIcon';
import { useRecoilCallback } from 'recoil';
import { usersAtom } from '@hooks/user';

const Roles = ChatsModel.Models.ChatParticipantRole;

interface Props
  extends Omit<ChatMemberProps, 'manage' | 'isSelf' | 'selfRole'> {
  role: ChatsModel.Models.ChatParticipantRole;
  closeAndRun: (callback: () => any, prev?: boolean) => () => void;
}

function AdminOptions({ participant, role, closeAndRun }: Props): JSX.Element {
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
    sendInviteToTargets,
  } = useChatManageActions();

  const chooseMuteOption = useRecoilCallback(
    (ctx) => async () => {
      if (isMutedData.is) return await unmute(participant.id);
      const user = await ctx.snapshot.getPromise(usersAtom(participant.userId));
      if (!user) return;
      openMuteModal(user, participant.id);
    },
    [isMutedData.is, openMuteModal, participant.id, participant.userId, unmute]
  );

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
            onClick={closeAndRun(
              () => transferOwnership(participant.id),
              false
            )}
          >
            Transfer Ownership
          </MenuOption>
        )}
        {(isMember || isSelfOwner) && (
          <>
            {left && !isBanned && (
              <MenuOption
                icon={AccountPlusIcon}
                color="warning"
                onClick={() =>
                  sendInviteToTargets([
                    { type: 'user', id: participant.userId },
                  ])
                }
              >
                Invite Back
              </MenuOption>
            )}
            {!isBanned && !left && (
              <>
                <MenuOption
                  icon={TimelapseIcon}
                  color="danger"
                  onClick={chooseMuteOption}
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
      left,
      isBanned,
      chooseMuteOption,
      isMutedData.is,
      toggleAdmin,
      participant.id,
      participant.userId,
      transferOwnership,
      sendInviteToTargets,
      kick,
      unban,
      ban,
    ]
  );
}

export default function ChatManageMember({
  disabled = false,
  participant,
  role,
  closeAndRun,
  ...props
}: {
  disabled?: boolean;
  participant: ChatsModel.Models.IChatParticipant;
  role: ChatsModel.Models.ChatParticipantRole;
  closeAndRun: (callback: () => any, prev?: boolean) => () => void;
} & IconButtonProps): JSX.Element {
  const {
    useIsBlocked,
    block,
    unblock,
    useIsFriend,
    goToMessages,
    goToProfile,
    sendFriendRequest,
  } = useFriend(participant.userId);
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
            <MenuOption
              icon={AccountPlusIcon}
              onClick={closeAndRun(sendFriendRequest)}
            >
              Send Friend Request
            </MenuOption>
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
      sendFriendRequest,
      unblock,
      block,
      role,
      participant,
    ]
  );
}
