import {
  Box,
  Button,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Sheet,
  Textarea,
  Typography,
} from '@mui/joy';
import { useSseEvent } from '@hooks/sse';
import { SseModel } from '@typings/models';
import React from 'react';
import tunnel from '@lib/tunnel';
import { atom, useRecoilState } from 'recoil';
import { UserAvatar } from './AvatarWithStatus';

type Message = SseModel.Models.TestMessage;

const messagesAtom = atom<Message[]>({
  key: 'sse/test',
  default: [],
});

export default function SseTester(): JSX.Element {
  const [messages, setMessages] = useRecoilState(messagesAtom);
  const [message, setMessage] = React.useState('');

  useSseEvent<SseModel.DTO.Test>(
    'test',
    ({ data }) => {
      setMessages((prev) => [...prev, data]);
    },
    [setMessages]
  );

  const submit = React.useCallback(async (message: string) => {
    await tunnel.post(SseModel.Endpoints.Targets.Test, { message });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  return React.useMemo(
    () => (
      <Sheet
        variant="soft"
        sx={{
          height: 'fit-content',
          width: '100%',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: (theme) => theme.radius.xs,
        }}
      >
        <Typography level="h4">SSE Tester</Typography>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await submit(message);
          }}
        >
          <Textarea
            placeholder="New Message"
            size="sm"
            sx={{ mt: 2, width: '100%' }}
            value={message}
            onChange={(ev) => setMessage(ev.target.value)}
            minRows={2}
            maxRows={4}
            variant="plain"
            endDecorator={
              <Box
                sx={{
                  w: '100%',
                  display: 'flex',
                  gap: 'var(--Textarea-paddingBlock)',
                  pt: 'var(--Textarea-paddingBlock)',
                  px: 'var(--Textarea-paddingBlock)',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  flex: 'auto',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography level="body-xs">
                  {message.length} character(s)
                </Typography>
                <Button
                  disabled={message.trim().length === 0}
                  size="sm"
                  type="submit"
                >
                  Send
                </Button>
              </Box>
            }
          />
        </form>
        <List style={{ width: '100%' }} size="lg">
          {messages.map(({ message, user: { name, avatar } }, i) => (
            <ListItem key={i}>
              <ListItemDecorator>
                <UserAvatar src={avatar} />
              </ListItemDecorator>
              <ListItemContent>
                <Typography level="title-sm">{name}</Typography>
                <Typography level="body-sm" noWrap>
                  {message}
                </Typography>
              </ListItemContent>
            </ListItem>
          ))}
        </List>
      </Sheet>
    ),
    [message, messages, submit]
  );
}
