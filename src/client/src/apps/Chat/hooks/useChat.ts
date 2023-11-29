import {
  useRecoilCallback,
  useRecoilTransaction_UNSTABLE,
  useRecoilValue,
} from 'recoil';
import chatsState from '../state';
import ChatsModel from '@typings/models/chat';
import { navigate } from 'wouter/use-location';
import tunnel from '@lib/tunnel';
import { useChatPasswordInputModalActions } from '../modals/ChatPasswordInputModal/hooks/useChatPasswordInputModal';
import notifications from '@lib/notifications/hooks';
import { EndpointData } from '@typings/api';

const useChat = (chatId: number) => {
  const useInfo = () => useRecoilValue(chatsState.chatInfo(chatId));
  const useHeaderNames = () =>
    useRecoilValue(chatsState.participantNames(chatId));
  const useMessages = () => useRecoilValue(chatsState.messages(chatId));
  const useMessageIds = () => useRecoilValue(chatsState.messageIds(chatId));
  const useLastMessage = () => useRecoilValue(chatsState.lastMessage(chatId));
  const useParticipants = () => useRecoilValue(chatsState.participants(chatId));
  const useParticipantIds = () =>
    useRecoilValue(chatsState.participantIds(chatId));
  const useParticipant = (participantId: number) =>
    useRecoilValue(chatsState.participant({ chatId, participantId }));
  const useSelfParticipant = () =>
    useRecoilValue(chatsState.selfParticipantByChat(chatId));
  const useMessage = (messageId: number) =>
    useRecoilValue(chatsState.message({ chatId, messageId }));
  const useSelf = () => useRecoilValue(chatsState.chat(chatId));
  const useType = () => useRecoilValue(chatsState.chatType(chatId));
  const useIsSelected = () => useRecoilValue(chatsState.isChatSelected(chatId));

  const goTo = useRecoilTransaction_UNSTABLE(
    (ctx) => async () => {
      const selectedChatId = ctx.get(chatsState.selectedChatId);
      if (selectedChatId === chatId) return;
      ctx.set(chatsState.selectedChatId, chatId);
      navigate(`/messages/${chatId}`);
    },
    [chatId]
  );

  const useIsParticipantBlocked = (participantId: number) =>
    useRecoilValue(chatsState.isParticipantBlocked({ chatId, participantId }));
  const useIsTargetRecipientBlocked = () =>
    useRecoilValue(chatsState.isTargetRecipientBlocked(chatId));
  const useIsParticipantMutedComputed = (
    pId: number
  ):
    | { is: false }
    | { is: true; type: 'temporary' | 'permanent'; until?: number } => {
    const participant = useParticipant(pId);
    if (participant.muted === ChatsModel.Models.ChatParticipantMuteType.No)
      return { is: false };
    if (participant.muted === ChatsModel.Models.ChatParticipantMuteType.Forever)
      return { is: true, type: 'permanent' };

    if (Date.now() >= participant.mutedUntil!) return { is: false };
    return { is: true, type: 'temporary', until: participant.mutedUntil! };
  };
  const useIsSelfMutedComputed = () => {
    const self = useSelfParticipant();
    return useIsParticipantMutedComputed(self.id);
  };
  const useParticipantNamesTyping = () =>
    useRecoilValue(chatsState.participantsWithNameTyping(chatId));

  const { prompt: promptChatPassword } = useChatPasswordInputModalActions();
  const attemptToJoin = useRecoilCallback(
    (ctx) =>
      async (
        messageData?: EndpointData<ChatsModel.Endpoints.JoinChat>['messageData']
      ) => {
        try {
          const chatInfo = await tunnel.get(
            ChatsModel.Endpoints.Targets.GetChatInfo,
            { chatId }
          );
          console.log(chatInfo);

          if (chatInfo.type !== ChatsModel.Models.ChatType.Group)
            throw new Error('Chat is not a group.');
          let passwordPrompt: string | undefined;
          switch (chatInfo.authorization) {
            case ChatsModel.Models.ChatAccess.Protected: {
              passwordPrompt = await promptChatPassword({
                chatName: chatInfo.name,
              });
              if (!passwordPrompt.trim().length) return;
              break;
            }
          }
          const { isActive } = ctx.snapshot.getInfo_UNSTABLE(
            chatsState.chat(chatId)
          );
          const chat = await tunnel.post(
            ChatsModel.Endpoints.Targets.JoinChat,
            {
              password: passwordPrompt,
              messageData,
              returnChatInfo: isActive,
            },
            {
              chatId,
            }
          );
          if (chat) {
            ctx.set(chatsState.chat(chatId), {
              ...chat,
              authorizationData: null,
            });
          }
          ctx.set(chatsState.chats, (prev) => [...prev, chatId]);
          navigate(`/messages/${chatId}`);
          notifications.success('Joined chat', `You joined ${chatInfo.name}`);
        } catch (e) {
          notifications.error('Failed to join chat', (e as Error).message);
        }
      },
    [chatId, promptChatPassword]
  );

  return {
    id: chatId,
    useInfo,
    useHeaderNames,
    useMessages,
    useMessageIds,
    useLastMessage,
    useParticipants,
    useParticipantIds,
    useParticipant,
    useSelfParticipant,
    useMessage,
    useSelf,
    useType,
    useIsSelected,
    useIsParticipantBlocked,
    useIsTargetRecipientBlocked,
    useIsParticipantMutedComputed,
    useIsSelfMutedComputed,
    goTo,
    useParticipantNamesTyping,
    attemptToJoin,
  };
};

export const useSelectedChat = () => {
  const selectedChatId = useRecoilValue(chatsState.selectedChatId);
  return useChat(selectedChatId);
};

export default useChat;
