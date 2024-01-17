import { useRecoilValue } from 'recoil';
import friendsState from '../state';
import notificationsState from '@apps/Inbox/state';
import NotificationsModel from '@typings/models/notifications';
import UsersModel from '@typings/models/users';

export const useFriends = () => useRecoilValue(friendsState.friends);
export const useBlocked = () => useRecoilValue(friendsState.blocked);
export const useFriendRequests = () =>
  useRecoilValue(
    notificationsState.byTag(NotificationsModel.Models.Tags.UserFriendsRequest)
  ) as UsersModel.DTO.FriendRequestNotification[];
