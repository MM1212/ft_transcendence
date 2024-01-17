import UsersModel from '@typings/models/users';
import { atom } from 'recoil';

export interface UserSearchResult extends UsersModel.Models.IUserInfo {
  isFriend: boolean;
  isBlocked: boolean;
  friendRequestSent: boolean;
}

const profileState = new (class ProfileState {
  searchInput = atom<string>({
    key: 'searchInput',
    default: '',
  });
  searchInputDirty = atom<boolean>({
    key: 'searchInputDirty',
    default: false,
  });
  searchLoading = atom<boolean>({
    key: 'searchLoading',
    default: false,
  });
  searchResults = atom<UserSearchResult[]>({
    key: 'searchResults',
    default: [],
  });
})();

export default profileState;
