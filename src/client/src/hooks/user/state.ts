import tunnel from '@lib/tunnel';
import UsersModel from '@typings/models/users';
import { atom, atomFamily, selectorFamily } from 'recoil';

export const sessionAtom = atom<UsersModel.Models.IUserInfo | null>({
  key: 'session',
  default: null,
});

export const usersAtom = atomFamily<UsersModel.Models.IUserInfo, number>({
  key: 'user',
  default: selectorFamily<UsersModel.Models.IUserInfo, number>({
    key: 'user/selector',
    get: (id) => async () => {
      const resp = await tunnel.get(UsersModel.Endpoints.Targets.GetUser, {
        id,
      });
      if (resp.status === 'error') throw new Error(resp.errorMsg);
      return resp.data;
    },
  }),
});
