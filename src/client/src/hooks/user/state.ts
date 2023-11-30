import tunnel from '@lib/tunnel';
import { AuthModel } from '@typings/models';
import UsersModel from '@typings/models/users';
import { atom, atomFamily, selector, selectorFamily } from 'recoil';

export const sessionAtom = atom<AuthModel.DTO.Session | null>({
  key: 'session',
  default: null,
});

export const isLoggedInSelector = selector<boolean>({
  key: 'user/isLoggedIn',
  get: ({ get }) => {
    return !!get(sessionAtom);
  },
});

export const usersAtom = atomFamily<UsersModel.Models.IUserInfo | null, number>(
  {
    key: 'user',
    default: selectorFamily<UsersModel.Models.IUserInfo | null, number>({
      key: 'user/selector',
      get: (id) => async () => {
        try {
          return await tunnel.get(UsersModel.Endpoints.Targets.GetUser, {
            id,
          });
        } catch (e) {
          return null;
        }
      },
    }),
  }
);
