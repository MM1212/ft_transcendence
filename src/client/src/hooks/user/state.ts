import tunnel from '@lib/tunnel';
import UsersModel from '@typings/models/users';
import { atom, atomFamily, selectorFamily } from 'recoil';

export const sessionAtom = atom<UsersModel.Models.IUserInfo | null>({
  key: 'session',
  default: null,
});

export const usersAtom = atomFamily<UsersModel.Models.IUserInfo | null, number>({
  key: 'user',
  default: selectorFamily<UsersModel.Models.IUserInfo | null, number>({
    key: 'user/selector',
    get: (id) => async () => {
      try {
        return await tunnel.get(UsersModel.Endpoints.Targets.GetUser, {
          id,
        });
      } catch(e) {
        return null;
      }
    },
  }),
});
