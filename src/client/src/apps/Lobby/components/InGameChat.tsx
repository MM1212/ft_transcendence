import { useKeybindsToggle } from '@hooks/keybinds';
import { Typography } from '@mui/joy';
import { Box, Sheet } from '@mui/joy';
import React, { useRef } from 'react';
import { useUser } from '@hooks/user';
import { enablePlayerInput } from '../../Lobby_Old/state';
import { useRecoilState, useRecoilValue } from 'recoil';
import type ChatsModel from '@typings/models/chat';
import useChat from '@apps/Chat/hooks/useChat';
import { lobbyAtom } from '../state';
import chatsState from '@apps/Chat/state';
import MessageInputSelector from '@apps/Chat/components/MessageInput';
import { useIsLobbyLoading } from '../hooks';

interface ChatBoxProps {}

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

const listItemStyles = {
  p: 1,
  maxHeight: '20dvh',
  height: '25%',
  overflowY: 'auto',
  bgcolor: 'rgba(0, 0, 0, 0.3)',
  width: '100%',
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: 0.1,
};

function RenderMessages({ chatId }: { chatId: number }): JSX.Element {
  const messages = useRecoilValue(chatsState.messages(chatId));

  return (
    <Sheet sx={listItemStyles}>
      {messages.map((message, index) => {
        return <Message key={index} {...message} />;
      })}
    </Sheet>
  );
}

const InputBox = React.forwardRef<HTMLInputElement, { chatId: number }>(
  ({ chatId }, ref): JSX.Element => {
    return (
      <MessageInputSelector
        id={chatId}
        autoFocus={false}
        rootProps={React.useMemo(
          () => ({
            sx: {
              pointerEvents: 'none',
            },
          }),
          []
        )}
        inputProps={React.useMemo(
          () => ({ ref, size: 'sm', color: 'warning', variant: 'outlined' }),
          [ref]
        )}
        submitBtnProps={React.useMemo(
          () => ({
            size: 'sm',
            color: 'warning',
            variant: 'plain',
          }),
          []
        )}
      />
    );
  }
);

const ChatBox: React.FC<ChatBoxProps> = () => {
  const [focus, setFocus] = useRecoilState(enablePlayerInput);
  const inputRef = useRef<HTMLInputElement>(null);

  const event = React.useCallback(
    (key: string, pressed: boolean, e: KeyboardEvent) => {
      if (!pressed) return;
      e.stopPropagation();
      e.preventDefault();
      console.log(key, focus, inputRef.current);

      if (focus) {
        setFocus(false);
        inputRef.current?.querySelector('textarea')?.focus();
        e.preventDefault();
      } else {
        setFocus(true);
        inputRef.current?.querySelector('textarea')?.blur();
        e.preventDefault();
      }
    },
    [focus, setFocus]
  );
  useKeybindsToggle(['Tab'], event, []);

  const lobby = useRecoilValue(lobbyAtom);
  const isLobbyLoading = useIsLobbyLoading();

  if (!lobby || isLobbyLoading || lobby.chatId === -1) return null;
  return (
    <Box
      sx={{
        maxWidth: '50dvh',
        width: '50%',
        margin: 'auto',
        position: 'absolute',
        bottom: (theme) => theme.spacing(1),
        left: (theme) => theme.spacing(1),
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      }}
    >
      <RenderMessages chatId={lobby.chatId} />
      <Sheet
        sx={{
          mt: 1,
          display: 'flex',
          bgcolor: 'rgba(0, 0, 0, 0.3)',
          width: '100%',
        }}
      >
        <InputBox chatId={lobby.chatId} ref={inputRef} />
      </Sheet>
    </Box>
  );
};

export default ChatBox;
