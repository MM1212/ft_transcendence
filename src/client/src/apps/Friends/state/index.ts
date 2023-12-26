import { usersAtom } from '@hooks/user';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import UsersModel from '@typings/models/users';
import { atom, selector, selectorFamily, waitForAll } from 'recoil';

const friendsState = new (class FriendsState {
  friends = atom<number[]>({
    key: 'user/friends',
    default: selector<number[]>({
      key: 'user/friends/default',
      get: async () => {
        try {
          return await tunnel.get(
            UsersModel.Endpoints.Targets.GetSessionFriends
          );
        } catch (e) {
          console.error(e);
          notifications.error((e as Error).message);
          return [];
        }
      },
    }),
  });
  friendsExtended = selector<UsersModel.Models.IUserInfo[]>({
    key: 'user/friends/extended',
    get: async ({ get }) => {
      const friends = get(this.friends);
      return get(waitForAll(friends.map((id) => usersAtom(id)))).filter(
        Boolean
      ) as UsersModel.Models.IUserInfo[];
    },
  });
  blocked = atom<number[]>({
    key: 'user/blocked',
    default: selector<number[]>({
      key: 'user/blocked/default',
      get: async () => {
        try {
          return await tunnel.get(
            UsersModel.Endpoints.Targets.GetSessionBlocked
          );
        } catch (e) {
          console.error(e);
          notifications.error((e as Error).message);
          return [];
        }
      },
    }),
  });
  friend = selectorFamily<UsersModel.Models.IUserInfo | null, number>({
    key: 'user/friend',
    get:
      (id) =>
      ({ get }) => {
        const friends = get(this.friends);
        if (!friends.includes(id)) return null;
        return get(usersAtom(id));
      },
  });
  blockedUser = selectorFamily<UsersModel.Models.IUserInfo | null, number>({
    key: 'user/blockedUser',
    get:
      (id) =>
      ({ get }) => {
        const blocked = get(this.blocked);
        if (!blocked.includes(id)) return null;
        return get(usersAtom(id));
      },
  });

  onlineFriends = selector<number[]>({
    key: 'user/friends/online',
    get: ({ get }) => {
      const friends = get(this.friends);
      const users = get(waitForAll(friends.map(usersAtom)));
      return (
        users.filter(
          (user) => user?.status !== UsersModel.Models.Status.Offline
        ) as UsersModel.Models.IUserInfo[]
      ).map((user) => user.id);
    },
  });

  allFriends = selector<number[]>({
    key: 'user/friends/all',
    get: ({ get }) => {
      const friends = get(this.friends);
      const users = get(waitForAll(friends.map(usersAtom)));
      [...users].sort((a, b) => {
        const aOnline = a?.status !== UsersModel.Models.Status.Offline;
        const bOnline = b?.status !== UsersModel.Models.Status.Offline;
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        return 0;
      });
      return (users.filter(Boolean) as UsersModel.Models.IUserInfo[]).map(
        (user) => user.id
      );
    },
  });
})();

export default friendsState;
