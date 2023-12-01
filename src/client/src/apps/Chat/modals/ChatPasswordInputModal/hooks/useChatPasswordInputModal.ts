import { useModal, useModalActions } from '@hooks/useModal';
import React from 'react';

export interface ChatPasswordInputModalState {
  chatName: string;
  onSelect?: (input: string) => any;
  /**
   *
   * @private Internal use only
   */
  onCancel?: () => void;
}

export const PUBLIC_CHATS_MODAL_ID = 'chat:input-password';

export const useChatPasswordInputModal = () =>
  useModal<ChatPasswordInputModalState>(PUBLIC_CHATS_MODAL_ID);

export const useChatPasswordInputModalActions = () => {
  const actions = useModalActions<ChatPasswordInputModalState>(
    PUBLIC_CHATS_MODAL_ID
  );
  const prompt = React.useCallback(
    (props: Omit<ChatPasswordInputModalState, 'onSelect'>): Promise<string> => {
      return new Promise<string>((resolve) => {
        actions.open({
          ...props,
          onSelect: resolve,
          onCancel: () => resolve(''),
        });
      });
    },
    [actions]
  );

  return { ...actions, prompt };
};
