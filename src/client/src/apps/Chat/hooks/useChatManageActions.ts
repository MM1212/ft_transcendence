import { useModalActions } from '@hooks/useModal';
import {
  selector,
  useRecoilCallback,
  useRecoilValue,
  waitForAll,
} from 'recoil';
import chatsState from '../state';
import ChatsModel from '@typings/models/chat';
import UsersModel from '@typings/models/users';
import { usersAtom } from '@hooks/user';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';

const chatParticipantsDataSelector = selector<
  {
    participant: ChatsModel.Models.IChatParticipant;
    user: UsersModel.Models.IUserInfo;
  }[]
>({
  key: 'chatManageModal/chatParticipantsData',
  get: ({ get }) => {
    const chatId = get(chatsState.selectedChatId);
    const participants = get(chatsState.participants(chatId));
    const users = get(waitForAll(participants.map((p) => usersAtom(p.userId))));
    return participants.map((participant, i) => {
      return { participant, user: users[i]! };
    });
  },
});

const useChatManageActions = () => {
  const useModal = () => {
    const { open: openModal, close } = useModalActions<{ manage: boolean }>(
      'chat:members'
    );
    const open = (manage: boolean = false) => openModal({ manage });
    return { open, close };
  };

  const useParticipantsData = () =>
    useRecoilValue(chatParticipantsDataSelector);

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
        const chat = await ctx.snapshot.getPromise(chatsState.chat(chatId));
        await tunnel.post(ChatsModel.Endpoints.Targets.LeaveChat, undefined, {
          chatId,
        });
        notifications.success(`You left chat ${chat.name}`);
      } catch (e) {
        notifications.error('Failed to leave chat', (e as Error).message);
      }
    },
    []
  );

  const kick = useRecoilCallback(
    (ctx) => async (pId: number) => {
      try {
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
    []
  );

  const ban = useRecoilCallback(
    (ctx) => async (pId: number) => {
      try {
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
    []
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
    []
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
    []
  );

  return {
    useModal,
    useParticipantsData,
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
  };
};

export default useChatManageActions;
