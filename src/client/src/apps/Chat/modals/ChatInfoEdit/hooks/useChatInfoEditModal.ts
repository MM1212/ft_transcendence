import { useModal, useModalActions } from '@hooks/useModal';

export interface ChatInfoEditModalState {
  chatId: number;
}

export const CHAT_INFO_EDIT_MODAL_ID = 'chat:edit';

export const useChatInfoEditModal = () =>
  useModal<ChatInfoEditModalState>(CHAT_INFO_EDIT_MODAL_ID);

export const useChatInfoEditModalActions = () =>
  useModalActions<ChatInfoEditModalState>(CHAT_INFO_EDIT_MODAL_ID);
