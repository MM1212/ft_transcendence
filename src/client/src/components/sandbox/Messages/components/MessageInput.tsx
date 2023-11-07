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
  const submit = useRecoilCallback(
    (ctx) => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (input.trim().length === 0) return;
      console.log(input);

      try {
        const chat = await ctx.snapshot.getPromise(chatsState.chat(id));
        if (!chat) throw new Error('Could not find chat');
        const now = performance.now();
        const selfParticipant = await ctx.snapshot.getPromise(
          chatsState.selfParticipantByChat(chat.id)
        );
        const nonce = Math.random().toString(36).slice(2);
        ctx.set(chatsState.messages(chat.id), (prev) => [
          {
            id: nonce as any,
            chatId: chat.id,
            type: ChatsModel.Models.ChatMessageType.Normal,
            message: input.trim(),
            meta: {},
            createdAt: Date.now(),
            authorId: selfParticipant.id,
            pending: true,
          },
          ...prev,
        ]);
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

        setInput('');
        ctx.set(chatsState.messages(chat.id), (prev) => {
          const next = [...prev];
          const idx = next.findIndex((msg) => msg.id === (nonce as any));
          if (idx === -1) return next;
          next[idx] = resp.data;
          return next;
        });
        console.log(performance.now() - now, 'ms', 'to set chats');
      } catch (e) {
        console.error(e);
        notifications.error('Could not send message', (e as Error).message);
      }
    },
    [id, input, setInput]
  );
  return (
    <Stack
      sx={{ px: 2, pb: 3 }}
      direction="row"
      alignItems="center"
      spacing={1}
      width="100%"
      component="form"
      onSubmit={submit}
      ref={formRef}
    >
      <FormControl
        style={{
          flexGrow: 1,
        }}
      >
        <Textarea
          placeholder="Type something here…"
          aria-label="Message"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          minRows={1}
          maxRows={10}
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
            flexGrow: 1,
          }}
        />
      </FormControl>
      <IconButton
        size="md"
        color="primary"
        type="submit"
        variant="plain"
        sx={{
          borderRadius: (theme) => theme.radius.xl,
        }}
        disabled={input.trim().length === 0}
      >
        <SendIcon size="sm" />
      </IconButton>
    </Stack>
  );
}
