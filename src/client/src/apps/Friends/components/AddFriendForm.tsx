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
import tunnel from '@lib/tunnel';
import UsersModel from '@typings/models/users';
import { useRecoilCallback } from 'recoil';
import { sessionAtom } from '@hooks/user';
import notifications from '@lib/notifications/hooks';

export default function BasicModalDialog({
  setOpen,
  open,
}: {
  setOpen: (value: boolean) => void;
  open: boolean;
}) {
  const [inputValue, setInputValue] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleSubmit = useRecoilCallback(
    (ctx) => async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const value = formData.get('nickname') as string;

      try {
        const self = await ctx.snapshot.getPromise(sessionAtom);
        if (!self) throw new Error('You are not logged in');
        const resp = await tunnel.post(
          UsersModel.Endpoints.Targets.AddFriendByName,
          {
            nickname: value,
          },
          {
            id: self.id,
          }
        );
        if (resp.status !== 'ok') throw new Error(resp.errorMsg);
        setOpen(false);
        setInputValue('');
        notifications.success('Add friend', 'Friend added (TEMP)');
      } catch (e) {
        setFeedbackMessage((e as Error).message);
      }
    },
    [setOpen]
  );
  useEffect(() => {
    setFeedbackMessage(null);
  }, [open]);

  return (
    <React.Fragment>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogContent>
            You can add a friend with their nickname
          </DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl color={feedbackMessage ? 'neutral' : 'danger'}>
                <FormLabel>Name</FormLabel>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  name="nickname"
                  placeholder="nickname"
                  autoFocus
                />
                {feedbackMessage && (
                  <FormHelperText>{feedbackMessage}</FormHelperText>
                )}
              </FormControl>
              <Button type="submit">Send Friend Request</Button>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
}
