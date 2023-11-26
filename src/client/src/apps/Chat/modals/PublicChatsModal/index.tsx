import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy';
import { usePublicChatsModal } from './hooks/usePublicChatsModal';
import React from 'react';
import ChatsModel from '@typings/models/chat';
import tunnel from '@lib/tunnel';
import AccountGroupIcon from '@components/icons/AccountGroupIcon';
import { useRecoilValue } from 'recoil';
import chatsState from '@apps/Chat/state';

function Entry(props: ChatsModel.Models.IChatInfo) {
  const { id, name, photo, participantsCount, topic } = props;
  const chats = useRecoilValue(chatsState.chats);
  const joined = React.useMemo(() => chats.includes(id), [chats, id]);
  return React.useMemo(
    () => (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={(theme) => ({
          p: 1,
          borderRadius: 'md',
          transition: theme.transitions.create('background-color', {
            duration: theme.transitions.duration.shortest,
          }),
          '&:hover': {
            backgroundColor: theme.palette.background.level1,
          },
        })}
      >
        <Avatar src={photo ?? undefined}>
          <AccountGroupIcon />
        </Avatar>
        <Stack spacing={0.5} flexGrow={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography level="title-sm">{name}</Typography>
            {topic && <Typography level="body-xs">{topic}</Typography>}
          </Box>
          <Typography level="body-xs">{participantsCount} members</Typography>
        </Stack>
        <Button variant="solid" color="primary" disabled={joined} size="sm">
          {joined ? 'Joined' : 'Join'}
        </Button>
      </Stack>
    ),
    [joined, name, participantsCount, photo, topic]
  );
}

function _ModalContent(): JSX.Element {
  const [chats, setChats] = React.useState<ChatsModel.Models.IChatInfo[]>([]);
  const [loading, setLoading] = React.useState(false);

  const loadPublicChats = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await tunnel.get(
        ChatsModel.Endpoints.Targets.GetPublicChats
      );
      setChats(data);
    } catch (error) {
      setLoading(false);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPublicChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <CircularProgress variant="plain" />;
  return (
    <Stack spacing={1} width="100%">
      {chats.map((chat) => (
        <Entry key={chat.id} {...chat} />
      ))}
    </Stack>
  );
}

const ModalContent = React.memo(_ModalContent);

export default function PublicChatsModalView(): JSX.Element {
  const { close, isOpened } = usePublicChatsModal();

  return (
    <Modal
      open={isOpened}
      onClose={close}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ModalDialog>
        <DialogTitle>
          Public Chats
          <ModalClose onClick={close} />
        </DialogTitle>
        <DialogContent
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ModalContent />
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}
