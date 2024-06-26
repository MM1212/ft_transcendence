import { useModalActions } from '@hooks/useModal';
import { useRecoilCallback } from 'recoil';
import chatsState from '../state';
import ChatsModel from '@typings/models/chat';
import UsersModel from '@typings/models/users';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import { useConfirmationModalActions } from '@apps/Modals/Confirmation/hooks';
import {
  ChatSelectedData,
  useChatSelectModalActions,
} from '../modals/ChatSelectModal/hooks/useChatSelectModal';
import { useChatInfoEditModalActions } from '../modals/ChatInfoEdit/hooks/useChatInfoEditModal';
import pongGamesState from '@apps/GameLobby/state';
import { sessionAtom } from '@hooks/user';
import { ChatModel } from '@typings/models';
import PongModel from '@typings/models/pong';

const useChatManageActions = () => {
  const useModal = () => {
    const { open: openModal, close } = useModalActions<{ manage: boolean }>(
      'chat:members'
    );
    const open = (manage: boolean = false) => openModal({ manage });
    return { open, close };
  };
  const { confirm } = useConfirmationModalActions();
  const { select } = useChatSelectModalActions();

  const toggleAdmin = useRecoilCallback(
    (ctx) => async (pId: number, is: boolean) => {
      try {
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before demoting a user');
        await tunnel.patch(
          ChatsModel.Endpoints.Targets.UpdateParticipant,
          {
            role: is
              ? ChatsModel.Models.ChatParticipantRole.Admin
              : ChatsModel.Models.ChatParticipantRole.Member,
          },
          { chatId, participantId: pId }
        );
        notifications.success('User permissions changed!');
      } catch (e) {
        notifications.error(
          'Failed to change user permissions',
          (e as Error).message
        );
      }
    },
    []
  );

  const leave = useRecoilCallback(
    (ctx) => async () => {
      try {
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before leaving it');
        const self = await ctx.snapshot.getPromise(
          chatsState.selfParticipantByChat(chatId)
        );
        if (!self) throw new Error('You are not in this chat');
        const participants = await ctx.snapshot.getPromise(
          chatsState.activeParticipants(chatId)
        );
        console.log(participants);
        if (self.role === ChatsModel.Models.ChatParticipantRole.Owner) {
          const confirmed = await confirm({
            content: `
              Are you sure you want to leave this chat?
              This will select a new owner for this chat (the oldest member, prioritizing admins).
          `,
            confirmText: 'Leave',
            confirmColor: 'warning',
            keepOpen: true,
          });
          if (!confirmed) return;
        }

        if (participants.length === 1) {
          const confirmed = await confirm({
            content: `
              Are you sure you want to leave this chat?
              This action will delete it as there are no other members.
          `,
            confirmText: 'Leave',
          });
          if (!confirmed) return;
        }
        const chat = await ctx.snapshot.getPromise(chatsState.chat(chatId));
        await tunnel.post(ChatsModel.Endpoints.Targets.LeaveChat, undefined, {
          chatId,
        });
        notifications.success(`You left chat ${chat.name}`);
      } catch (e) {
        notifications.error('Failed to leave chat', (e as Error).message);
      }
    },
    [confirm]
  );

  const kick = useRecoilCallback(
    (ctx) => async (pId: number) => {
      try {
        const confirmed = await confirm({
          content: 'Are you sure you want to kick this user?',
          confirmText: 'Kick',
        });
        if (!confirmed) return;
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before kicking a user');
        await tunnel.del(ChatsModel.Endpoints.Targets.DeleteParticipant, {
          chatId,
          participantId: pId,
        });
        notifications.success('User kicked!');
      } catch (e) {
        notifications.error('Failed to kick user', (e as Error).message);
      }
    },
    [confirm]
  );

  const ban = useRecoilCallback(
    (ctx) => async (pId: number) => {
      try {
        const confirmed = await confirm({
          content: 'Are you sure you want to ban this user?',
          confirmText: 'Ban',
        });
        if (!confirmed) return;
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before banning a user');
        await tunnel.post(
          ChatsModel.Endpoints.Targets.BanParticipant,
          undefined,
          {
            chatId,
            participantId: pId,
          }
        );
        notifications.success('User banned!');
      } catch (e) {
        notifications.error('Failed to ban user', (e as Error).message);
      }
    },
    [confirm]
  );

  const unban = useRecoilCallback(
    (ctx) => async (pId: number) => {
      try {
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before unbanning a user');
        await tunnel.del(ChatsModel.Endpoints.Targets.BanParticipant, {
          chatId,
          participantId: pId,
        });
        notifications.success('User unbanned!');
      } catch (e) {
        notifications.error('Failed to unban user', (e as Error).message);
      }
    },
    []
  );

  const unmute = useRecoilCallback(
    (ctx) => async (pId: number) => {
      try {
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before unmuting a user');
        await tunnel.patch(
          ChatsModel.Endpoints.Targets.UpdateParticipant,
          {
            muted: ChatsModel.Models.ChatParticipantMuteType.No,
            mutedUntil: undefined,
          },
          {
            chatId,
            participantId: pId,
          }
        );
        notifications.success('User unmuted!');
      } catch (e) {
        notifications.error('Failed to unmute user', (e as Error).message);
      }
    },
    []
  );

  const transferOwnership = useRecoilCallback(
    (ctx) => async (pId: number) => {
      try {
        const confirmed = await confirm({
          content: `
            Are you sure you want to transfer ownership to this user?
            This action cannot be undone and you will lose all permissions in this chat.
        `,
          confirmText: 'Transfer',
        });
        if (!confirmed) return;
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error(
            'You must select a chat before transferring ownership to a user'
          );
        await tunnel.post(
          ChatsModel.Endpoints.Targets.TransferOwnership,
          {
            targetParticipantId: pId,
          },
          {
            chatId,
          }
        );
        notifications.success('Ownership transferred!');
      } catch (e) {
        notifications.error(
          'Failed to transfer ownership',
          (e as Error).message
        );
      }
    },
    [confirm]
  );

  const { open: _openMuteModal } = useModalActions<{
    user: UsersModel.Models.IUserInfo;
    participantId: number;
  }>('chat:mute-participant');
  const openMuteModal = useRecoilCallback(
    (ctx) =>
      async (user: UsersModel.Models.IUserInfo, participantId: number) => {
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before muting a user');
        _openMuteModal({
          user,
          participantId,
        });
      },
    [_openMuteModal]
  );

  const mute = useRecoilCallback(
    (ctx) =>
      async (pId: number, until: number): Promise<boolean> => {
        try {
          const chatId = await ctx.snapshot.getPromise(
            chatsState.selectedChatId
          );
          if (chatId === -1)
            throw new Error('You must select a chat before muting a user');
          await tunnel.post(
            ChatsModel.Endpoints.Targets.MuteParticipant,
            {
              until: until === -1 ? undefined : until,
            },
            {
              chatId,
              participantId: pId,
            }
          );
          notifications.success('User muted!');
          return true;
        } catch (e) {
          notifications.error('Failed to mute user', (e as Error).message);
          return false;
        }
      },
    []
  );

  const nuke = useRecoilCallback(
    (ctx) => async () => {
      try {
        const confirmed = await confirm({
          content: `
            Are you sure you want to delete this chat?
            This action cannot be undone and the chat will be permanently removed.
        `,
          confirmText: 'Delete',
        });
        if (!confirmed) return;
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before nuking it');
        await tunnel.del(ChatsModel.Endpoints.Targets.DeleteChat, {
          chatId,
        });
        notifications.success('Chat nuked!');
      } catch (e) {
        notifications.error('Failed to nuke chat', (e as Error).message);
      }
    },
    [confirm]
  );

  const sendInviteFromGroup = useRecoilCallback(
    (ctx) => async () => {
      try {
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before inviting a user');
        const selected = await select({
          multiple: true,
          body: ` Select chats to send an invite to.`,
          exclude: [{ type: 'chat', id: chatId }],
        });
        if (!selected || !selected.length) return;
        await tunnel.post(
          ChatsModel.Endpoints.Targets.SendInviteToTargets,
          selected,
          {
            chatId,
          }
        );
        notifications.success('Invites sent!');
      } catch (e) {
        notifications.error('Failed to send invites', (e as Error).message);
      }
    },
    [select]
  );

  const sendInviteToTargets = useRecoilCallback(
    (ctx) => async (targets: ChatSelectedData[]) => {
      try {
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before inviting a user');
        await tunnel.post(
          ChatsModel.Endpoints.Targets.SendInviteToTargets,
          targets,
          {
            chatId,
          }
        );
        notifications.success('Invites sent!');
      } catch (e) {
        notifications.error('Failed to send invites', (e as Error).message);
      }
    },
    []
  );
  const { close } = useChatInfoEditModalActions();

  const updateInfo = useRecoilCallback(
    (ctx) => async (info: ChatsModel.DTO.DB.UpdateChatInfo) => {
      try {
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before updating its info');
        await tunnel.patch(ChatsModel.Endpoints.Targets.UpdateChatInfo, info, {
          chatId,
        });
        notifications.success('Chat info updated!');
        close();
      } catch (e) {
        notifications.error('Failed to update chat info', (e as Error).message);
      }
    },
    [close]
  );

  const inviteToPongLobby = useRecoilCallback(
    (ctx) => async (chatId:number) => {
      try {
        const chat = await ctx.snapshot.getPromise(chatsState.chat(chatId));
        let lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
        const session = await ctx.snapshot.getPromise(sessionAtom)
        if (!chat) throw new Error('Chat not found');
        if (!session) throw new Error('Session not found');
        let lobbyId = lobby?.id;
        if (lobby) {
          if (lobby.ownerId !== session.id)
            throw new Error('You are not the owner of the lobby');
        } else {
          lobbyId = undefined;
        }
        
        let selected: ChatSelectedData[] = [];
        if (chat.type === ChatModel.Models.ChatType.Group) {
          selected = [
            {
              id: chat.id,
              type: 'chat',
            },
          ];
        } else {
          const other = chat.participants.find(
            (p) => p.userId !== session.id
          );
          if (!other) throw new Error('No other user found');
          selected = [
            {
              id: other.userId, 
              type: 'user',
            },
          ];
        }
        if (selected.length === 0) throw new Error('No players selected');
        console.log(lobbyId, selected);
        lobby = await tunnel.post(PongModel.Endpoints.Targets.Invite, {
          lobbyId: lobbyId,
          data: selected,
          source: PongModel.Models.InviteSource.Chat,
        });
        ctx.set(pongGamesState.gameLobby, lobby);
        notifications.success('Invite sent');
      } catch (err) {
        console.log(err);
      }
    },
    []
  );

  return {
    useModal,
    toggleAdmin,
    kick,
    ban,
    unban,
    unmute,
    mute,
    leave,
    transferOwnership,
    openMuteModal,
    nuke,
    sendInviteFromGroup,
    sendInviteToTargets,
    updateInfo,
    inviteToPongLobby,
  };
};

export default useChatManageActions;
