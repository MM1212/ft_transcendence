import * as React from 'react';
import Box, { BoxProps } from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Stack, { StackProps } from '@mui/joy/Stack';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import MessagesPaneHeader from './MessagesPaneHeader';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import chatsState from '@/apps/Chat/state';
import tunnel from '@lib/tunnel';
import ChatsModel from '@typings/models/chat';
import notifications from '@lib/notifications/hooks';
import InfiniteScroll from '@components/InfiniteScroll';
import { CircularProgress, Typography } from '@mui/joy';

function ChatMessagesImpl({ id }: { id: number }) {
  const messages = useRecoilValue(chatsState.messages(id));

  const [hasMore, setHasMore] = React.useState(true);

  const resetMessages = useRecoilCallback(
    (ctx) => async () => {
      const chats = await ctx.snapshot.getPromise(chatsState.chats);
      if (!chats.includes(id)) return;
      ctx.set(chatsState.messages(id), (prev) =>
        prev.length > ChatsModel.Models.MAX_MESSAGES_PER_CHAT
          ? prev.slice(0, ChatsModel.Models.MAX_MESSAGES_PER_CHAT)
          : prev
      );
    },
    [id]
  );

  React.useEffect(() => {
    resetMessages();
  }, [resetMessages, id]);

  React.useEffect(() => {
    setHasMore(true);
  }, [id]);

  const next = useRecoilCallback(
    (ctx) => async () => {
      // const timestamp = Date.now();
      // console.log(`[${timestamp}] Fetching messages for ${id}`);

      const chats = await ctx.snapshot.getPromise(chatsState.chats);
      if (!chats.includes(id)) return;
      const lastMessages = await ctx.snapshot.getPromise(
        chatsState.messages(id)
      );
      let lastMessageId = lastMessages.length
        ? lastMessages[lastMessages.length - 1]?.id ?? -1
        : -1;
      if (isNaN(parseInt(lastMessageId as unknown as string)))
        lastMessageId = -1;
      /*  console.log(
        `[${timestamp}] Fetching messages from ${lastMessageId} for ${id}`
      ); */

      try {
        const messages = await tunnel.get(
          ChatsModel.Endpoints.Targets.GetChatMessages,
          {
            chatId: id,
            cursor: lastMessageId,
          }
        );
        /* console.log(
          `[${timestamp}] Loaded ${
            messages.length
          } from ${lastMessageId} as cursor to ${
            messages.length ? messages[messages.length - 1]?.id ?? -1 : -1
          }`
        ); */
        ctx.set(chatsState.messages(id), (prev) => [...prev, ...messages]);
        if (messages.length < ChatsModel.Models.MAX_MESSAGES_PER_CHAT)
          return setHasMore(false);
      } catch (e) {
        console.error(e);
        notifications.error('Failed to fetch messages', (e as Error).message);
      }
    },
    [id, setHasMore]
  );

  const computeMessageFeatures = React.useCallback(
    (messages: ChatsModel.Models.IChatMessage[], messageIdx: number) => {
      const message = messages[messageIdx];
      const prev = messages[messageIdx + 1];
      const next = messages[messageIdx - 1];
      let hasPrev =
        prev &&
        prev.authorId === message.authorId &&
        Math.abs(prev.createdAt - message.createdAt) < 60000;
      if (
        message.type === ChatsModel.Models.ChatMessageType.Embed ||
        prev?.type === ChatsModel.Models.ChatMessageType.Embed
      ) {
        hasPrev = false;
      }
      let hasNext =
        next &&
        next.authorId === message.authorId &&
        Math.abs(message.createdAt - next.createdAt) < 60000;
      if (
        message.type === ChatsModel.Models.ChatMessageType.Embed ||
        next?.type === ChatsModel.Models.ChatMessageType.Embed
      ) {
        hasNext = false;
      }
      return {
        prev: !!hasPrev,
        next: !!hasNext,
      };
    },
    []
  );

  const messagesComputed = React.useMemo(
    () =>
      messages.map((message, index: number) => {
        const features = computeMessageFeatures(messages, index);
        return (
          <React.Suspense fallback={<></>} key={`${id}-${message.id}`}>
            <ChatBubble
              chatId={id}
              messageId={message.id}
              message={message}
              key={`${id}-${message.id}`}
              featuresNext={features.next}
              featuresPrev={features.prev}
            />
          </React.Suspense>
        );
      }),
    [computeMessageFeatures, id, messages]
  );

  return React.useMemo(
    () => (
      <InfiniteScroll
        boxProps={
          {
            component: Stack,
            spacing: 2,
            justifyContent: 'flex-end',
            direction: 'column-reverse',
          } as unknown as BoxProps & StackProps
        }
        next={next}
        hasMore={hasMore}
        loader={
          <CircularProgress
            color="warning"
            sx={{
              position: 'absolute',
              my: 2,
              mx: 'auto',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        }
        endMessage={
          <Typography
            sx={{
              mx: 'auto',
              my: 2,
            }}
            color="neutral"
            level="body-xs"
            textAlign="center"
          >
            No more messages to load.
          </Typography>
        }
        inverse
      >
        {messagesComputed}
      </InfiniteScroll>
    ),
    [hasMore, messagesComputed, next]
  );
}
const ChatMessages = React.memo(ChatMessagesImpl);

export default function MessagesPane() {
  const selectedChatId = useRecoilValue(chatsState.selectedChatId);
  if (selectedChatId === -1) return null;
  return (
    <Sheet
      sx={{
        height: '100%',
        minHeight: '100%',
        width: '80dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.level1',
      }}
    >
      <React.Suspense fallback={<></>}>
        <MessagesPaneHeader />
      </React.Suspense>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          height: '100%',
          position: 'relative',
          overflowY: 'auto',
        }}
      >
        <React.Suspense fallback={<></>}>
          <ChatMessages id={selectedChatId} key={selectedChatId} />
        </React.Suspense>
      </Box>

      <MessageInput id={selectedChatId} />
    </Sheet>
  );
}
