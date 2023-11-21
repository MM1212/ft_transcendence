import { useRecoilCallback, useRecoilValue } from 'recoil';
import chatsState from '../state';
import { useLocation } from 'wouter';

const useChat = (chatId: number) => {
  const useInfo = () => useRecoilValue(chatsState.chatInfo(chatId));
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

  const [, navigate] = useLocation();
  const goTo = useRecoilCallback(
    (ctx) => () => {
      ctx.set(chatsState.isChatSelected(chatId), true);
      navigate(`/messages/${chatId}`);
    },
    [chatId, navigate]
  );
  return {
    id: chatId,
    useInfo,
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
    goTo,
  };
};

export const useSelectedChat = () => {
  const selectedChatId = useRecoilValue(chatsState.selectedChatId);
  return useChat(selectedChatId);
};

export default useChat;
