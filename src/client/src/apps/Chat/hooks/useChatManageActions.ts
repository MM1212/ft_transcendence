import { useModalActions } from '@hooks/useModal';
import {
  selector,
  useRecoilValue,
  waitForAll,
} from 'recoil';
import chatsState from '../state';
import ChatsModel from '@typings/models/chat';
import UsersModel from '@typings/models/users';
import { usersAtom } from '@hooks/user';

const chatParticipantsDataSelector = selector<
  {
    participant: ChatsModel.Models.IChatParticipant;
    user: UsersModel.Models.IUserInfo;
  }[]
>({
  key: 'chatManageModal/chatParticipantsData',
  get: ({ get }) => {
    const chatId = get(chatsState.selectedChatId);
    const participants = get(chatsState.participants(chatId));
    const users = get(waitForAll(participants.map((p) => usersAtom(p.userId))));
    return participants.map((participant, i) => {
      return { participant, user: users[i] };
    });
  },
});

const useChatManageActions = () => {
  const useModal = () => {
    const { open: openModal, close } = useModalActions<{ manage: boolean }>(
      'chat:members'
    );
    const open = (manage: boolean = false) => openModal({ manage });
    return { open, close };
  };

  const useParticipantsData = () =>
    useRecoilValue(chatParticipantsDataSelector);

  return { useModal, useParticipantsData };
};

export default useChatManageActions;
