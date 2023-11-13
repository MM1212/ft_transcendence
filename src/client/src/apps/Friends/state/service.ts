import { useSseEvent } from '@hooks/sse';
import UsersModel from '@typings/models/users';
import { useRecoilCallback } from 'recoil';
import friendsState from '.';

export const useFriendsService = () => {
  const onFriendsUpdate = useRecoilCallback(
    ({ set }) =>
      (ev: UsersModel.Sse.UserFriendsUpdatedEvent) => {
        const { data } = ev;
        console.log('friends update', data);
        
        if (data.friends && data.friends.length)
          set(friendsState.friends, (prev) => {
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
        if (data.blocked && data.blocked.length)
          set(friendsState.blocked, (prev) => {
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
  );

  useSseEvent<UsersModel.Sse.UserFriendsUpdatedEvent>(
    UsersModel.Sse.Events.UserFriendsUpdated,
    onFriendsUpdate
  );
};
