import {
  Modal,
  ModalDialog,
  DialogTitle,
  ModalClose,
  DialogContent,
  FormControl,
  FormLabel,
  Input,
  DialogActions,
  Button,
} from '@mui/joy';
import { useChatPasswordInputModal } from './hooks/useChatPasswordInputModal';
import React from 'react';
import LockIcon from '@components/icons/LockIcon';

export default function ChatPasswordInputModalView(): JSX.Element {
  const {
    close,
    isOpened,
    data: { chatName, onCancel, onSelect },
  } = useChatPasswordInputModal();
  const [input, setInput] = React.useState('');

  const onSubmit = React.useCallback(() => {
    onSelect?.(input.trim());
    close();
    setInput('');
  }, [close, input, onSelect]);

  const handleClose = (
    _event?: {} | undefined,
    reason?: 'backdropClick' | 'escapeKeyDown' | 'closeClick' | undefined
  ) => {
    close(_event, reason);
    onCancel?.();
  };

  return (
    <Modal
      open={isOpened}
      onClose={handleClose}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ModalDialog>
        <DialogTitle>
          {chatName} password
          <ModalClose onClick={handleClose} />
        </DialogTitle>
        <DialogContent>
          <FormControl
            required
            component="form"
            onSubmit={(ev) => {
              ev.preventDefault();
              onSubmit();
            }}
          >
            <FormLabel>Password</FormLabel>
            <Input
              autoFocus
              type="password"
              value={input}
              placeholder="Enter the chat password"
              startDecorator={<LockIcon />}
              onChange={(e) => setInput(e.target.value)}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="solid"
            disabled={input.trim().length === 0}
            onClick={onSubmit}
          >
            Submit
          </Button>
          <Button
            color="neutral"
            variant="plain"
            onClick={() => {
              handleClose(undefined, 'closeClick');
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
