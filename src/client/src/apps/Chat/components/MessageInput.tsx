import * as React from 'react';
import FormControl from '@mui/joy/FormControl';
import Textarea from '@mui/joy/Textarea';
import { IconButton, Stack } from '@mui/joy';
import SendIcon from '@components/icons/SendIcon';
import { useRecoilCallback, useRecoilState } from 'recoil';
import chatsState from '@/apps/Chat/state';
import tunnel from '@lib/tunnel';
import ChatsModel from '@typings/models/chat';
import notifications from '@lib/notifications/hooks';
import useChat from '../hooks/useChat';
import moment from 'moment';
import TimelapseIcon from '@components/icons/TimelapseIcon';

export default function MessageInput({ id }: { id: number }) {
  const [input, setInput] = useRecoilState(chatsState.chatsInput(id));
  const formRef = React.useRef<HTMLFormElement>(null);
  const submit = useRecoilCallback(
    (ctx) => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (input.trim().length === 0) return;
      try {
        const chat = await ctx.snapshot.getPromise(chatsState.chat(id));
        if (!chat) throw new Error('Could not find chat');
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
        setInput('');
        const resp = await tunnel.rawPut(
          ChatsModel.Endpoints.Targets.CreateMessage,
          {
            message: input.trim(),
            type: ChatsModel.Models.ChatMessageType.Normal,
            meta: {},
          },
          { chatId: id }
        );
        if (resp.status !== 'ok') {
          ctx.set(chatsState.messages(chat.id), (prev) =>
            prev.filter((msg) => msg.id !== (nonce as any))
          );
          throw new Error(resp.errorMsg ?? 'Unknown Error');
        }
        ctx.set(chatsState.messages(chat.id), (prev) => {
          const next = [...prev];
          const idx = next.findIndex((msg) => msg.id === (nonce as any));
          if (idx === -1) return next;
          next[idx] = resp.data;
          return next;
        });
      } catch (e) {
        console.error(e);
        notifications.error('Could not send message', (e as Error).message);
      }
    },
    [id, input, setInput]
  );
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, id]);

  const self = useChat(id).useSelfParticipant();

  const mutedData = useChat(id).useIsSelfMutedComputed();
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
          placeholder={
            !mutedData.is
              ? 'Type something here…'
              : `You've been muted until ${
                  mutedData.type === 'permanent'
                    ? 'forever'
                    : moment(self.mutedUntil).format('lll')
                }`
          }
          disabled={mutedData.is}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          minRows={1}
          maxRows={10}
          slotProps={{
            textarea: {
              ref: inputRef,
            },
          }}
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
        disabled={input.trim().length === 0 || mutedData.is}
      >
        {!mutedData.is ? (
          <SendIcon size="sm" />
        ) : (
          <TimelapseIcon color="neutral" />
        )}
      </IconButton>
    </Stack>
  );
}
