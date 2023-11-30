import { ModalOpenProps, useModal, useModalActions } from '@hooks/useModal';
import React from 'react';

export interface ChatSelectedData {
  type: 'chat' | 'user';
  id: number;
}

export interface ChatSelectState {
  body?: React.ReactNode;
  multiple?: boolean;
  includeDMs?: boolean;
  exclude?: ChatSelectedData[];
  /**
   * Will return an array of selected chat ids
   * If multiple is false, the array will only contain one element
   * If canceled, the array will be empty (so that the promise can be resolved and not hang)
   * @private Internal use only
   */
  onSelect?: (selected: ChatSelectedData[]) => any;
  /**
   *
   * @private Internal use only
   */
  onCancel?: () => void;
}

export const CHAT_SELECT_ID = 'chat:select';

export const useChatSelectModal = () => useModal<ChatSelectState>(CHAT_SELECT_ID);

export const useChatSelectModalActions = () => {
  const actions = useModalActions<ChatSelectState>(CHAT_SELECT_ID);
  const select = React.useCallback(
    (
      props: Omit<ModalOpenProps<ChatSelectState>, 'onConfirm'>
    ): Promise<ChatSelectedData[]> => {
      return new Promise<ChatSelectedData[]>((resolve) => {
        actions.open({
          ...props,
          onSelect: resolve,
          onCancel: () => resolve([]),
        });
      });
    },
    [actions]
  );

  return { ...actions, select };
};
