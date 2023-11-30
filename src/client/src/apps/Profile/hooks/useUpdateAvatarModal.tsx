import { useModal, useModalActions } from '@hooks/useModal';

export interface SelectUserAvatarState {
  avatar: string;
  onSubmit?: (avatar: string) => void;
}

export const SELECT_USER_AVATAR_ID = 'profile:select-avatar';

export const useSelectUserAvatar = () =>
  useModal<SelectUserAvatarState>(SELECT_USER_AVATAR_ID);

export const useSelectUserAvatarActions = () =>
  useModalActions<SelectUserAvatarState>(SELECT_USER_AVATAR_ID);
