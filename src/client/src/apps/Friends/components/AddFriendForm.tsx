import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormHelperText,
} from '@mui/joy';
import { sampleUsers } from '@apps/Lobby/state/mockup';

export default function BasicModalDialog({
  setOpen,
  open,
}: {
  setOpen: (value: boolean) => void;
  open: boolean;
}) {
  const [inputValue, setInputValue] = useState<string>('');
  const [isInputValid, setIsInputValid] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = formData.get('nickname') as string;

    setInputValue(value);

    const isValid = sampleUsers.some((user) => user.nickname === value);
    setIsInputValid(isValid);
    setIsSubmitting(true);
  };
  const message = isInputValid
    ? 'Friend Request Sent'
    : 'User does not exist or is already your friend';
  useEffect(() => {
    setIsInputValid(true);
  }, [open]);

  return (
    <React.Fragment>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogContent>
            You can add a friend with their intra username
          </DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl color={isInputValid ? 'neutral' : 'danger'}>
                <FormLabel>Name</FormLabel>
                <Input name="nickname" placeholder="Intra username" autoFocus />
                {isSubmitting && <FormHelperText>{message}</FormHelperText>}
              </FormControl>
              <Button type="submit">Send Friend Request</Button>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
}
