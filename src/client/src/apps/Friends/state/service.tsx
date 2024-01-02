import { useSseEvent } from '@hooks/sse';
import UsersModel from '@typings/models/users';
import { useRecoilCallback } from 'recoil';
import friendsState from '.';
import { useRegisterNotificationTemplate } from '@apps/Inbox/state/hooks';
import NotificationsModel from '@typings/models/notifications';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import AccountCheckIcon from '@components/icons/AccountCheckIcon';
import AccountMinusIcon from '@components/icons/AccountMinusIcon';

export const useFriendsService = () => {
  const onFriendsUpdate = useRecoilCallback(
    (ctx) => (ev: UsersModel.Sse.UserFriendsUpdatedEvent) => {
      const { data } = ev;
      console.log('friends update', data);

      if (data.friends && data.friends.length) {
        const { isActive } = ctx.snapshot.getInfo_UNSTABLE(
          friendsState.friends
        );
        if (isActive)
          ctx.set(friendsState.friends, (prev) => {
            const newFriends = [...prev];
            data.friends?.forEach((e) => {
              switch (e.type) {
                case 'add':
                  newFriends.push(e.id);
                  break;
                case 'remove':
                  newFriends.splice(newFriends.indexOf(e.id), 1);
                  break;
              }
            });
            return newFriends;
          });
      }
      if (data.blocked && data.blocked.length) {
        const { isActive } = ctx.snapshot.getInfo_UNSTABLE(
          friendsState.blocked
        );
        if (isActive)
          ctx.set(friendsState.blocked, (prev) => {
            const newBlocked = [...prev];
            data.blocked?.forEach((e) => {
              switch (e.type) {
                case 'add':
                  newBlocked.push(e.id);
                  break;
                case 'remove':
                  newBlocked.splice(newBlocked.indexOf(e.id), 1);
                  break;
              }
            });
            return newBlocked;
          });
      }
    }
  );

  useSseEvent<UsersModel.Sse.UserFriendsUpdatedEvent>(
    UsersModel.Sse.Events.UserFriendsUpdated,
    onFriendsUpdate
  );

  useRegisterNotificationTemplate<UsersModel.DTO.FriendRequestNotification>(
    NotificationsModel.Models.Tags.UserFriendsRequest,
    (ctx) => {
      ctx
        .setIcon((notif) => {
          const data = notif.data as {
            targetId?: number;
            sender?: boolean;
            senderId?: boolean;
            status: string;
          };
          if (data.sender) return <AccountPlusIcon />;
          if (data.status === 'pending') return <AccountPlusIcon />;
          if (data.status === 'accepted') return <AccountCheckIcon />;
          return <AccountMinusIcon />;
        })
        .setRouteTo('/friends/pending')
        .addCustomAction({
          id: 'accept',
          label: 'Accept',
          Icon: AccountCheckIcon,
          color: 'success',
          show: (n) => n.data.type === 'receiver' && n.data.status === 'pending',
        })
        .addCustomAction({
          id: 'reject',
          label: 'Reject',
          Icon: AccountMinusIcon,
          color: 'danger',
          show: (n) => n.data.type === 'receiver' && n.data.status === 'pending',
        });
    },
    []
  );
};
