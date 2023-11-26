import { ModalOpenProps, useModal, useModalActions } from '@hooks/useModal';
import { ColorPaletteProp, VariantProp } from '@mui/joy';
import React from 'react';

export interface ConfirmationModalState {
  header?: React.ReactNode;
  headerIcon?: React.ComponentType;
  content: React.ReactNode;
  confirmColor?: ColorPaletteProp;
  confirmVariant?: VariantProp;
  confirmText?: React.ReactNode;
  cancelColor?: ColorPaletteProp;
  cancelVariant?: VariantProp;
  cancelText?: React.ReactNode;
  onConfirm: () => any;
  onCancel?: () => void;
}

export const CONFIRMATION_MODAL_ID = 'misc:confirmation-dialog';

export const useConfirmationModal = () =>
  useModal<ConfirmationModalState>(CONFIRMATION_MODAL_ID);

export const useConfirmationModalActions = () => {
  const actions = useModalActions<ConfirmationModalState>(
    CONFIRMATION_MODAL_ID
  );

  const confirm = React.useCallback(
    (
      props: Omit<
        ModalOpenProps<ConfirmationModalState>,
        'onConfirm' | 'onCancel'
      >
    ): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        actions.open({
          ...props,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    },
    [actions]
  );

  return { ...actions, confirm };
};
