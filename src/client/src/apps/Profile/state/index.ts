import friendsState from '@apps/Friends/state';
import UsersModel from '@typings/models/users';
import { DefaultValue, atom } from 'recoil';

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
  searchResults = atom<(UsersModel.Models.IUserInfo & { isFriend: boolean })[]>(
    {
      key: 'searchResults',
      default: [],
    }
  );
})();

export default profileState;
