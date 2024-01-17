import AccountSearchIcon from '@components/icons/AccountSearchIcon';
import { FormControl, FormLabel, Input } from '@mui/joy';
import {
  useRecoilCallback,
  useRecoilState,
  useSetRecoilState,
} from 'recoil';
import profileState from '../state';
import { useDebounce } from '@hooks/lodash';
import tunnel from '@lib/tunnel';
import UsersModel from '@typings/models/users';
import notifications from '@lib/notifications/hooks';
import React from 'react';
import friendsState from '@apps/Friends/state';
import notificationsState from '@apps/Inbox/state';
import NotificationsModel from '@typings/models/notifications';

export default function UserSearch() {
  const [input, setInput] = useRecoilState(profileState.searchInput);
  const setLoading = useSetRecoilState(profileState.searchLoading);
  const setInputDirty = useSetRecoilState(profileState.searchInputDirty);
  const firtMountRef = React.useRef(true);
  const _searchForUsers = useRecoilCallback(
    (ctx) => async (input: string) => {
      ctx.set(profileState.searchLoading, true);
      try {
        const result = await tunnel.post(
          UsersModel.Endpoints.Targets.SearchUsers,
          { excluseSelf: true, query: input }
        );
        if (result.length === 0) {
          ctx.set(profileState.searchResults, []);
          return;
        }
        const friends = await ctx.snapshot.getPromise(friendsState.friends);
        const blocked = await ctx.snapshot.getPromise(friendsState.blocked);
        const friendRequests = await ctx.snapshot.getPromise(
          notificationsState.byTag(NotificationsModel.Models.Tags.UserFriendsRequest)
        ) as UsersModel.DTO.FriendRequestNotification[];
        ctx.set(
          profileState.searchResults,
          result.map((user) => ({
            ...user,
            isFriend: friends.includes(user.id),
            isBlocked: blocked.includes(user.id),
            friendRequestSent: friendRequests.some((n) => n.data.uId === user.id),
          }))
        );
      } catch (e) {
        notifications.warning('Failed to fetch users', (e as Error).message);
      } finally {
        setTimeout(() => ctx.set(profileState.searchLoading, false), 1000);
      }
    },
    []
  );

  const searchForUsers = useDebounce(_searchForUsers, 500, []);

  React.useEffect(() => {
    if (firtMountRef.current) {
      firtMountRef.current = false;
      return;
    }
    console.log(searchForUsers);
    setInputDirty(true);
    if (input.length > 0) {
      searchForUsers(input);
    } else {
      setLoading(false);
      searchForUsers.cancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  React.useEffect(() => {
    setInputDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormControl>
      <FormLabel>Search for a user</FormLabel>
      <Input
        placeholder="User nickname"
        fullWidth
        startDecorator={<AccountSearchIcon />}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
    </FormControl>
  );
}
