import MessageInputSelector from '@apps/Chat/components/MessageInput';
import useChat from '@apps/Chat/hooks/useChat';
import chatsState from '@apps/Chat/state';
import pongGamesState from '@apps/GameLobby/state';
import { useUser } from '@hooks/user';
import { Box, Typography } from '@mui/joy';
import ChatsModel from '@typings/models/chat';
import React from 'react';
import { useRecoilValue } from 'recoil';

function Message(message: ChatsModel.Models.IChatMessage): JSX.Element {
  const author = useChat(message.chatId).useParticipant(message.authorId);
  const user = useUser(author.userId)!;
  return React.useMemo(
    () => (
      <Typography level="title-sm">
        {user.nickname}:{' '}
        <Typography level="body-xs">{message.message}</Typography>
      </Typography>
    ),
    [message.message, user.nickname]
  );
}

export default function GameLobbyChat(): JSX.Element {
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;
  const messages = useRecoilValue(chatsState.messages(lobby.chatId));

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      flex={1}
      width="100%"
      gap={1}
      height="100%"
      maxHeight="100%"
    >
      <Box
        display="flex"
        flexDirection="column-reverse"
        overflow="auto"
        height="23dvh"
        gap={0.1}
      >
        {messages.map((message, i) => (
          <Message key={i} {...message} />
        ))}
      </Box>
      <MessageInputSelector
        id={lobby.chatId}
        rootProps={React.useMemo(
          () => ({
            sx: {},
          }),
          []
        )}
        inputProps={React.useMemo(() => ({ size: 'sm', color: 'warning' }), [])}
        submitBtnProps={React.useMemo(
          () => ({
            size: 'sm',
            color: 'warning',
          }),
          []
        )}
      />
    </Box>
  );
}
