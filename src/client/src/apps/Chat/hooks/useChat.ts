import { useRecoilState, useRecoilValue } from 'recoil';
import chatsState from '../state';
import { useLocation } from 'wouter';

const useChat = (chatId: number) => {
  const useMessages = () => useRecoilValue(chatsState.messages(chatId));
  const useMessageIds = () => useRecoilValue(chatsState.messageIds(chatId));
  const useLastMessage = () => useRecoilValue(chatsState.lastMessage(chatId));
  const useParticipants = () => useRecoilValue(chatsState.participants(chatId));
  const useParticipantIds = () =>
    useRecoilValue(chatsState.participantIds(chatId));
  const useParticipant = (participantId: number) =>
    useRecoilValue(chatsState.participant({ chatId, participantId }));
  const useMessage = (messageId: number) =>
    useRecoilValue(chatsState.message({ chatId, messageId }));
  const useSelf = () => useRecoilValue(chatsState.chat(chatId));

  const [isSelected, setSelected] = useRecoilState(
    chatsState.isChatSelected(chatId)
  );

  const [, navigate] = useLocation();
  const goTo = () => {
    setSelected(true);
    navigate(`/messages/${chatId}`);
  };
  return {
    useMessages,
    useMessageIds,
    useLastMessage,
    useParticipants,
    useParticipantIds,
    useParticipant,
    useMessage,
    useSelf,
    isSelected,
    goTo,
  };
};

export default useChat;
