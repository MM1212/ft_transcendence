import { useModal, useModalActions } from '@hooks/useModal';
import UsersModel from '@typings/models/users';

export type UpdateUserModalData = Pick<
  UsersModel.Models.IUserInfo,
  'id' | 'avatar' | 'nickname' | 'status'
>;

export interface UpdateUserModalState {
  header?: React.ReactNode;
  body?: React.ReactNode;
  map?: (
    data: UpdateUserModalData
  ) => Partial<UsersModel.Models.IUserInfo> | Promise<Partial<UsersModel.Models.IUserInfo>>;
  submitAnyway?: boolean;
}

export const UPDATE_USER_MODAL_ID = 'profile:change-user';

export const useUpdateUserModal = () =>
  useModal<UpdateUserModalState>(UPDATE_USER_MODAL_ID);

export const useUpdateUserModalActions = () =>
  useModalActions<UpdateUserModalState>(UPDATE_USER_MODAL_ID);
