import { useRecoilValue } from 'recoil';
import chatsState from '../state';

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
    useRecoilValue(chatsState.messageByIdx({ chatId, messageId }));
  const useSelf = () => useRecoilValue(chatsState.chat(chatId));
  return {
    useMessages,
    useMessageIds,
    useLastMessage,
    useParticipants,
    useParticipantIds,
    useParticipant,
    useMessage,
    useSelf,
  };
};

export default useChat;
