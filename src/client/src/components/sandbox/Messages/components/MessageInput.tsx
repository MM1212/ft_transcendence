import * as React from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import Textarea from '@mui/joy/Textarea';
import { IconButton, Stack } from '@mui/joy';
import FormatBoldIcon from '@components/icons/FormatBoldIcon';
import FormatItalicIcon from '@components/icons/FormatItalicIcon';
import FormatListBulletedIcon from '@components/icons/FormatListBulletedIcon';
import FormatStrikethroughVariantIcon from '@components/icons/FormatStrikethroughVariantIcon';
import SendIcon from '@components/icons/SendIcon';
import { useRecoilCallback, useRecoilState } from 'recoil';
import chatsState from '../state';
import tunnel from '@lib/tunnel';
import ChatsModel from '@typings/models/chat';
import notifications from '@lib/notifications/hooks';

export default function MessageInput({ id }: { id: number }) {
  const [input, setInput] = useRecoilState(chatsState.chatsInput(id));
  const formRef = React.useRef<HTMLFormElement>(null);
  const [loading, setLoading] = React.useState(false);
  const submit = useRecoilCallback(
    (ctx) => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (input.trim().length === 0) return;
      console.log(input);

      setLoading(true);
      try {
        const chats = [...(await ctx.snapshot.getPromise(chatsState.chats))];
        const chatIdx = chats.findIndex((chat) => chat.id === id);
        if (chatIdx === -1) throw new Error('Could not find chat');
        const chat = { ...chats[chatIdx] };
        const now = performance.now();
        const resp = await tunnel.put(
          ChatsModel.Endpoints.Targets.CreateMessage,
          {
            message: input.trim(),
            type: ChatsModel.Models.ChatMessageType.Normal,
            meta: {},
          },
          { chatId: id }
        );
        console.log(
          'took',
          performance.now() - now,
          'ms',
          'to resolve the request'
        );
        if (resp.status !== 'ok')
          throw new Error(resp.errorMsg ?? 'Unknown Error');
        console.log(performance.now() - now, 'ms', 'to set input to empty');
        chat.messages = [resp.data, ...chat.messages];
        chats[chatIdx] = chat;
        
        setInput('');
        setLoading(false);
        ctx.set(chatsState.chats, chats);
        console.log(performance.now() - now, 'ms', 'to set chats');
      } catch (e) {
        console.error(e);
        notifications.error('Could not send message', (e as Error).message);
        setLoading(false);
      }
    },
    [id, input, setInput]
  );
  return (
    <Box sx={{ px: 2, pb: 3 }}>
      <FormControl component="form" onSubmit={submit} ref={formRef}>
        <Textarea
          placeholder="Type something here…"
          aria-label="Message"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          minRows={1}
          maxRows={10}
          endDecorator={
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexGrow={1}
              sx={{
                pt: 0.75,
                pr: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <div>
                <IconButton size="sm" variant="plain" color="neutral">
                  <FormatBoldIcon />
                </IconButton>
                <IconButton size="sm" variant="plain" color="neutral">
                  <FormatItalicIcon />
                </IconButton>
                <IconButton size="sm" variant="plain" color="neutral">
                  <FormatStrikethroughVariantIcon />
                </IconButton>
                <IconButton size="sm" variant="plain" color="neutral">
                  <FormatListBulletedIcon />
                </IconButton>
              </div>
              <Button
                size="sm"
                color="primary"
                sx={{ alignSelf: 'center', borderRadius: 'sm' }}
                endDecorator={<SendIcon />}
                type="submit"
                disabled={input.trim().length === 0}
                loading={loading}
              >
                Send
              </Button>
            </Stack>
          }
          onKeyDown={(event) => {
            if (
              event.code === 'Enter' &&
              !event.altKey &&
              !event.ctrlKey &&
              !event.shiftKey
            ) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          sx={{
            '& textarea:first-of-type': {},
          }}
        />
      </FormControl>
    </Box>
  );
}
