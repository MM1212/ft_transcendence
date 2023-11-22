import { sessionAtom } from '@hooks/user';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import ChatsModel from '@typings/models/chat';
import UsersModel from '@typings/models/users';
import { useRecoilCallback } from 'recoil';
import useLocation from 'wouter/use-location';

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
        notifications.success('Blocked friend');
      } catch (e) {
        notifications.error('Failed to block friend', (e as Error).message);
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
        navigate(`/lobby/messages/${chatId}`);
      } catch (e) {
        notifications.error('Failed to go to messages', (e as Error).message);
      }
    },
    [friendId, navigate]
  );

  const goToProfile = () => {
    navigate(`/lobby/profile/${friendId}`);
  };
  return { remove, block, goToMessages, goToProfile };
};

export default useFriend;
