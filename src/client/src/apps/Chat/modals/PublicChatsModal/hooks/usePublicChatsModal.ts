import { useModal, useModalActions } from '@hooks/useModal';

export interface PublicChatsModalState {}

export const PUBLIC_CHATS_MODAL_ID = 'chat:public-chats';

export const usePublicChatsModal = () =>
  useModal<PublicChatsModalState>(PUBLIC_CHATS_MODAL_ID);

export const usePublicChatsModalActions = () =>
  useModalActions<PublicChatsModalState>(PUBLIC_CHATS_MODAL_ID);
