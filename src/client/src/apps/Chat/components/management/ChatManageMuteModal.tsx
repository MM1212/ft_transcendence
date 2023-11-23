import useChatManageActions from '@apps/Chat/hooks/useChatManageActions';
import { useModal } from '@hooks/useModal';
import { DialogContent } from '@mui/joy';
import {
  Button,
  DialogActions,
  Modal,
  ModalClose,
  ModalDialog,
  ToggleButtonGroup,
  Typography,
} from '@mui/joy';
import UsersModel from '@typings/models/users';
import moment from 'moment';
import React from 'react';

const timeOptions = [
  60000,
  60000 * 5,
  60000 * 10,
  60000 * 60,
  60000 * 60 * 24,
  60000 * 60 * 24 * 7,
  -1,
];

function ModalContent(): JSX.Element {
  const { data, close } = useModal<{
    user: UsersModel.Models.IUserInfo;
    participantId: number;
  }>('chat:mute-participant');
  const [time, setTime] = React.useState<string>(timeOptions[0].toString());
  const { mute } = useChatManageActions();
  const [loading, setLoading] = React.useState(false);
  const tryToMute = React.useCallback(async () => {
    setLoading(true);
    const muted = await mute(data.participantId, parseInt(time));
    setLoading(false);
    if (muted) close();
  }, [close, data.participantId, mute, time]);
  return (
    <DialogContent>
      <Typography level="title-lg">Mute {data.user.nickname}</Typography>
      <Typography level="body-xs" mb={2}>
        {data.user.nickname} will not be able to send messages in this chat
        <br /> for the amount of time you specify below.
        <br />
        This action can be undone while managing members.
      </Typography>
      <ToggleButtonGroup
        value={time}
        onChange={(_, v) => v && setTime(v)}
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {timeOptions.map((t) => (
          <Button key={t} value={t.toString()}>
            {t === -1 ? 'Forever' : moment.duration(t).humanize()}
          </Button>
        ))}
      </ToggleButtonGroup>
      <DialogActions>
        <Button
          color="danger"
          variant="soft"
          loading={loading}
          onClick={tryToMute}
        >
          Submit
        </Button>
        <Button
          variant="plain"
          color="neutral"
          onClick={close}
          disabled={loading}
        >
          Cancel
        </Button>
      </DialogActions>
    </DialogContent>
  );
}

export default function ChatManageMuteModal(): JSX.Element {
  const { isOpened, close } = useModal<{
    user: UsersModel.Models.IUserInfo;
    participantId: number;
    chatId: number;
  }>('chat:mute-participant');

  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog minWidth="xs" maxWidth="sm">
        <ModalClose />
        <ModalContent />
      </ModalDialog>
    </Modal>
  );
}
