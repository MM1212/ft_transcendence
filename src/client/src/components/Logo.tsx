import { Button, DialogActions, FormLabel, Input } from '@mui/joy';
import {
  Avatar,
  DialogContent,
  DialogTitle,
  FormControl,
  Modal,
  ModalDialog,
  Stack,
} from '@mui/joy';
import React from 'react';
import { mutate } from 'swr';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import tunnel from '@lib/tunnel';
import UsersModel from '@typings/models/users';
type IUser = UsersModel.Models.IUserInfo;
type State = Pick<IUser, 'avatar' | 'nickname'>;

export default function Logo(user: IUser): JSX.Element {
  const [input, setInput] = React.useState<State>(user);
  const [open, setOpen] = React.useState<boolean>(false);

  const updateProperty = React.useCallback(
    (key: keyof State) => (ev: React.ChangeEvent<HTMLInputElement>) => {
      setInput((prev) => ({ ...prev, [key]: ev.target.value }));
    },
    []
  );
  const cancelProperties = React.useCallback(async () => {
    setOpen(false);
  }, []);

  const submitProperties = React.useCallback(async () => {
    const resp = await tunnel.patch(UsersModel.Endpoints.Targets.PatchUser, {
      avatar: input.avatar,
      nickname: input.nickname,
    });
    if (resp.status === 'ok')
      mutate(buildTunnelEndpoint(Endpoints.UsersMe), undefined, {
        revalidate: true,
      });
    else console.error(resp.errorMsg);
  }, [input]);

  React.useEffect(() => {
    setInput(user);
  }, [user]);

  const propertiesUpdated = React.useMemo(() => {
    for (const key in input) {
      if (input[key as keyof State] !== user[key as keyof IUser]) return true;
    }
    return false;
  }, [input, user]);

  return (
    <>
      <Avatar
        src={user.avatar}
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer' }}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <DialogTitle></DialogTitle>
          <DialogContent>
            <form
              onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                setOpen(false);
              }}
            >
              <Stack spacing={2} direction="row" alignItems="center">
                <Avatar src={input.avatar} />
                <Stack spacing={1}>
                  <FormControl>
                    <FormLabel>Nickname</FormLabel>
                    <Input
                      autoFocus
                      required
                      value={input.nickname}
                      onChange={updateProperty('nickname')}
                      error={!input.nickname}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Avatar</FormLabel>
                    <Input
                      value={input.avatar}
                      type="url"
                      onChange={updateProperty('avatar')}
                      error={!input.avatar}
                    />
                  </FormControl>
                </Stack>
              </Stack>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={submitProperties} disabled={!propertiesUpdated}>
              Submit
            </Button>
            <Button variant="plain" color="neutral" onClick={cancelProperties}>
              Cancel
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}
