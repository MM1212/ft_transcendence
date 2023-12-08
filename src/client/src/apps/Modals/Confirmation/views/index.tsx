import AlertIcon from '@components/icons/AlertIcon';
import { useConfirmationModal } from '../hooks';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalDialog,
} from '@mui/joy';
import React from 'react';

export default function ConfirmationModalView(): JSX.Element {
  const {
    close,
    data: {
      header = 'Confirmation',
      headerIcon: HeaderIcon = AlertIcon,
      content,
      dismissable,
      cancelColor = 'neutral',
      cancelVariant = 'plain',
      cancelText = 'Cancel',
      confirmColor = 'danger',
      confirmVariant = 'solid',
      confirmText = 'Confirm',
      onCancel,
      onConfirm,
      keepOpen = false,
    },
    isOpened,
  } = useConfirmationModal();
  const [loading, setLoading] = React.useState(false);

  const handleClose = async (
    _event?: {} | undefined,
    reason?: 'backdropClick' | 'escapeKeyDown' | 'closeClick'
  ) => {
    await close(_event, reason);
    onCancel?.();
  };

  return (
    <Modal open={isOpened} onClose={handleClose}>
      <ModalDialog role="alertdialog" maxWidth="sm">
        <DialogTitle>
          <HeaderIcon />
          {header}
        </DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button
            color={confirmColor}
            variant={confirmVariant}
            loading={loading}
            onClick={async () => {
              setLoading(true);
              await Promise.resolve(onConfirm());
              setLoading(false);
              if (!keepOpen) await close();
            }}
          >
            {confirmText}
          </Button>
          {dismissable && (
            <Button
              color={cancelColor}
              variant={cancelVariant}
              disabled={loading}
              onClick={handleClose}
            >
              {cancelText}
            </Button>
          )}
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
