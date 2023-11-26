import { sessionAtom } from '@hooks/user';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import ChatsModel from '@typings/models/chat';
import UsersModel from '@typings/models/users';
import { useRecoilCallback } from 'recoil';
import useLocation from 'wouter/use-location';
import { useBlocked, useFriends } from '.';
import React from 'react';
import chatsState from '@apps/Chat/state';
import { useChatSelectModalActions } from '@apps/Chat/modals/ChatSelectModal/hooks/useChatSelectModal';

const useFriend = (friendId: number) => {
  const [, navigate] = useLocation();
  const remove = useRecoilCallback(
    (ctx) => async () => {
      try {
        const self = await ctx.snapshot.getPromise(sessionAtom);
        if (!self) throw new Error('You are not logged in');
        await tunnel.del(UsersModel.Endpoints.Targets.RemoveFriend, {
          id: self.id,
          friendId,
        });
        await tunnel.del(UsersModel.Endpoints.Targets.RemoveFriend, {
          id: self.id,
          friendId,
        });
        notifications.success('Removed friend');
      } catch (e) {
        notifications.error('Failed to remove friend', (e as Error).message);
      }
    },
    [friendId]
  );
  const block = useRecoilCallback(
    (ctx) => async () => {
      try {
        const self = await ctx.snapshot.getPromise(sessionAtom);
        if (!self) throw new Error('You are not logged in');
        await tunnel.put(UsersModel.Endpoints.Targets.BlockUser, undefined, {
          id: self.id,
          blockedId: friendId,
        });
        notifications.success('Blocked user');
      } catch (e) {
        notifications.error('Failed to block user', (e as Error).message);
      }
    },
    [friendId]
  );
  const unblock = useRecoilCallback(
    (ctx) => async () => {
      try {
        const self = await ctx.snapshot.getPromise(sessionAtom);
        if (!self) throw new Error('You are not logged in');
        await tunnel.del(UsersModel.Endpoints.Targets.UnblockUser, {
          id: self.id,
          blockedId: friendId,
        });
        notifications.success('Unblocked user');
      } catch (e) {
        notifications.error('Failed to unblock user', (e as Error).message);
      }
    },
    [friendId]
  );

  const goToMessages = useRecoilCallback(
    (ctx) => async () => {
      const self = await ctx.snapshot.getPromise(sessionAtom);
      if (!self) throw new Error('You are not logged in');
      try {
        const { chatId } = await tunnel.post(
          ChatsModel.Endpoints.Targets.CheckOrCreateDirectChat,
          undefined,
          { targetId: friendId }
        );
        navigate(`/messages/${chatId}`);
      } catch (e) {
        notifications.error('Failed to go to messages', (e as Error).message);
      }
    },
    [friendId, navigate]
  );

  const goToProfile = useRecoilCallback(
    (ctx) => async () => {
      const self = await ctx.snapshot.getPromise(sessionAtom);
      if (!self) throw new Error('You are not logged in');
      if (self.id === friendId) return navigate('/profile/me');
      navigate(`/profile/${friendId}`);
    },
    [friendId, navigate]
  );

  const useIsBlocked = () => {
    const blocked = useBlocked();
    return React.useMemo(() => blocked.includes(friendId), [blocked]);
  };
  const useIsFriend = () => {
    const friends = useFriends();
    return React.useMemo(() => friends.includes(friendId), [friends]);
  };

  const { select } = useChatSelectModalActions();
  const sendInviteFromDM = useRecoilCallback(
    (ctx) => async () => {
      try {
        const chatId = await ctx.snapshot.getPromise(chatsState.selectedChatId);
        if (chatId === -1)
          throw new Error('You must select a chat before inviting a user');
        const [chatData] = await select({
          multiple: false,
          includeDMs: false,
          body: ` Select a chat to send an invite to.`,
        });
        if (!chatData) return;
        await tunnel.post(
          ChatsModel.Endpoints.Targets.SendInviteToTargets,
          [
            {
              type: 'chat',
              id: chatId,
            },
          ],
          {
            chatId: chatData.id,
          }
        );
        notifications.success('Invites sent!');
      } catch (e) {
        notifications.error('Failed to send invites', (e as Error).message);
      }
    },
    [select]
  );

  return {
    remove,
    block,
    unblock,
    goToMessages,
    goToProfile,
    useIsBlocked,
    useIsFriend,
    sendInviteFromDM,
  };
};

export default useFriend;
