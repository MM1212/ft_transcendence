import {
  ChatSelectedData,
  useChatSelectModal,
} from './hooks/useChatSelectModal';
import chatsState from '@apps/Chat/state';
import friendsState from '@apps/Friends/state';
import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalDialog,
  Stack,
} from '@mui/joy';
import ChatsModel from '@typings/models/chat';
import React from 'react';
import { useRecoilCallback } from 'recoil';
import ChatSelectGroupEntry from './components/ChatSelectGroupEntry';
import ChatSelectUserEntry from './components/ChatSelectUserEntry';
import { sessionAtom } from '@hooks/user';

function _ChatSelectModal(): JSX.Element {
  const {
    close,
    isOpened,
    data: {
      onSelect,
      body = 'Select a chat to continue',
      exclude = [],
      includeDMs = true,
      multiple = false,
      onCancel,
    },
  } = useChatSelectModal();
  const [selected, setSelected] = React.useState<ChatSelectedData[]>([]);
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  const [options, setOptions] = React.useState<ChatSelectedData[]>([]);

  const loadOptions = useRecoilCallback(
    (ctx) => async () => {
      console.log('loading options');

      const self = await ctx.snapshot.getPromise(sessionAtom);
      if (!self) return;
      setLoadingOptions(true);
      const data: ChatSelectedData[] = [];
      // friends
      const friends = await ctx.snapshot.getPromise(friendsState.friends);
      const blocked = await ctx.snapshot.getPromise(friendsState.blocked);
      if (includeDMs) {
        data.push(
          ...friends
            .filter((friendId) => {
              if (exclude.some((e) => e.type === 'user' && e.id === friendId))
                return false;
              return true;
            })
            .map<ChatSelectedData>((friendId) => ({
              type: 'user',
              id: friendId,
            }))
        );
      }
      // chats
      const chats = await ctx.snapshot.getPromise(chatsState.allChats);
      data.push(
        ...chats
          .filter((chat) => {
            if (exclude.some((e) => e.type === 'chat' && e.id === chat.id))
              return false;
            if (
              chat.type === ChatsModel.Models.ChatType.Direct &&
              (!includeDMs ||
                chat.participants.some((p) => friends.includes(p.userId)))
            )
              return false;
            if (
              chat.authorization === ChatsModel.Models.ChatAccess.Private &&
              chat.type === ChatsModel.Models.ChatType.Group
            ) {
              const selfParticipant = chat.participants.find(
                (p) => p.userId === self.id
              );
              if (!selfParticipant) return false;
              if (
                selfParticipant.role !==
                ChatsModel.Models.ChatParticipantRole.Member
              )
                return true;
              return false;
            }
            if (chat.type === ChatsModel.Models.ChatType.Direct) {
              const other = chat.participants.find((p) => p.userId !== self.id);
              if (!other) return false;
              if (blocked.includes(other.userId)) return false;
              data.push({
                type: 'user',
                id: other.userId,
              });
              return false;
            }
            return true;
          })
          .map<ChatSelectedData>((chat) => ({
            type: 'chat',
            id: chat.id,
          }))
      );
      setOptions(data);
      setLoadingOptions(false);
    },
    [exclude, includeDMs]
  );

  React.useEffect(() => {
    setSelected([]);
    if (!isOpened) return;
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpened]);

  const toggleOption = React.useCallback(
    (option: ChatSelectedData) => {
      console.log('toggle option', option);

      setSelected((prev) => {
        if (!multiple) return [option];
        if (prev.some((p) => p.type === option.type && p.id === option.id)) {
          return prev.filter((p) => p.id !== option.id);
        }
        return [...prev, option];
      });
    },
    [multiple]
  );

  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog maxWidth="md">
        <DialogTitle>Chat Selection</DialogTitle>
        <DialogContent>
          {body}
          <Stack
            spacing={1}
            mt={2}
            px={0.5}
            alignItems="center"
            maxHeight="50dvh"
            overflow="hidden auto"
          >
            {loadingOptions ? (
              <CircularProgress variant="plain" />
            ) : (
              <>
                {options.map((option) => (
                  <React.Suspense
                    fallback={<></>}
                    key={`${option.type}-${option.id}`}
                  >
                    {option.type === 'chat' ? (
                      <ChatSelectGroupEntry
                        {...option}
                        multiple={multiple}
                        selected={selected.some((s) => s.type === option.type && s.id === option.id)}
                        toggle={() => toggleOption(option)}
                      />
                    ) : (
                      <ChatSelectUserEntry
                        {...option}
                        multiple={multiple}
                        selected={selected.some((s) => s.type === option.type && s.id === option.id)}
                        toggle={() => toggleOption(option)}
                      />
                    )}
                  </React.Suspense>
                ))}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="solid"
            disabled={selected.length === 0}
            onClick={() => {
              onSelect?.(selected);
              close();
            }}
          >
            Submit
          </Button>
          <Button
            color="neutral"
            variant="plain"
            onClick={() => {
              close(undefined, 'closeClick');
              onCancel?.();
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

const ChatSelectModal = React.memo(_ChatSelectModal);

export default ChatSelectModal;
