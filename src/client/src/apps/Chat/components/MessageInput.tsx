import * as React from 'react';
import FormControl from '@mui/joy/FormControl';
import Textarea from '@mui/joy/Textarea';
import { FormLabel, IconButton, Stack, Typography } from '@mui/joy';
import SendIcon from '@components/icons/SendIcon';
import { useRecoilCallback, useRecoilState } from 'recoil';
import chatsState from '@/apps/Chat/state';
import tunnel from '@lib/tunnel';
import ChatsModel from '@typings/models/chat';
import notifications from '@lib/notifications/hooks';
import useChat from '../hooks/useChat';
import moment from 'moment';
import TimelapseIcon from '@components/icons/TimelapseIcon';
import MessageInputBlocked from './MessageInputBlocked';
import { urlRegex } from './NewChat';
import { useDebounce, useThrottle } from '@hooks/lodash';

function _ParticipantsTyping({ id }: { id: number; selfId: number }) {
  const participantNames = useChat(id).useParticipantNamesTyping();

  const [threeDots, setThreeDots] = React.useState('');

  React.useEffect(() => {
    if (participantNames.length === 0) return;
    const interval = setInterval(() => {
      setThreeDots((prev) => {
        if (prev.length === 3) return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, [participantNames]);

  if (participantNames.length === 0) return null;
  return (
    <Typography level="body-xs" color="neutral">
      {participantNames}
      {threeDots}
    </Typography>
  );
}

const ParticipantsTyping = React.memo(_ParticipantsTyping);

function MessageInput({ id }: { id: number }) {
  const [input, setInput] = useRecoilState(chatsState.chatsInput(id));
  const formRef = React.useRef<HTMLFormElement>(null);

  const setIsTyping = React.useCallback(
    async (state: boolean) => {
      try {
        await tunnel.put(
          ChatsModel.Endpoints.Targets.SetTyping,
          {
            state,
          },
          {
            chatId: id,
          }
        );
      } catch (e) {
        console.error(e);
      }
    },
    [id]
  );
  const updateToTyping = useThrottle(() => setIsTyping(true), 3000, [
    setIsTyping,
  ]);
  const clearIsTyping = useDebounce(() => setIsTyping(false), 500, [
    setIsTyping,
  ]);

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
        const messagePayload: ChatsModel.DTO.NewMessage = {
          message: input.trim(),
          type: ChatsModel.Models.ChatMessageType.Normal,
          meta: {},
        };
        // Attachments embed
        if (messagePayload.message.match(urlRegex)) {
          messagePayload.type = ChatsModel.Models.ChatMessageType.Embed;
          const message = messagePayload.message;
          messagePayload.meta = {
            type: ChatsModel.Models.Embeds.Type.Media,
            urls: [],
          };
          messagePayload.meta.urls!.push(
            ...message
              .match(new RegExp(urlRegex, 'g'))!
              .map((url) => url.trim())
              .filter((url, i, arr) => arr.indexOf(url) === i)
          );
          urlRegex.lastIndex = 0;
        }
        ctx.set(chatsState.messages(chat.id), (prev) => [
          {
            ...messagePayload,
            id: nonce as any,
            chatId: chat.id,
            createdAt: Date.now(),
            authorId: selfParticipant.id,
            pending: true,
          },
          ...prev,
        ]);
        setInput('');
        clearIsTyping();
        const resp = await tunnel.rawPut(
          ChatsModel.Endpoints.Targets.CreateMessage,
          messagePayload,
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
    [clearIsTyping, id, input, setInput]
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
        <FormLabel>
          <ParticipantsTyping id={id} selfId={self.id} />
        </FormLabel>
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
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value.trim().length === 0) clearIsTyping();
            else updateToTyping();
          }}
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

export default function MessageInputSelector({
  id,
}: {
  id: number;
}): JSX.Element {
  const isTargetRecipientBlocked = useChat(id).useIsTargetRecipientBlocked();
  if (isTargetRecipientBlocked) return <MessageInputBlocked id={id} />;
  return <MessageInput id={id} />;
}
