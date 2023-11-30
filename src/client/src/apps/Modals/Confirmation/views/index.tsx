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
    },
    isOpened,
  } = useConfirmationModal();
  const [loading, setLoading] = React.useState(false);

  return (
    <Modal open={isOpened} onClose={close}>
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
              close();
            }}
          >
            {confirmText}
          </Button>
          {dismissable && (
            <Button
              color={cancelColor}
              variant={cancelVariant}
              disabled={loading}
              onClick={() => {
                close();
                onCancel?.();
              }}
            >
              {cancelText}
            </Button>
          )}
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
