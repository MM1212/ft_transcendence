import { useModal, useModalActions } from '@hooks/useModal';
import PongHistoryModel from '@typings/models/pong/history';

export interface PostPongGameModalState {
  history: PongHistoryModel.Models.Match;
}

export const POST_PONG_GAME_MODAL_ID = 'pong:game:game';

export const usePostPongGameModal = () =>
  useModal<PostPongGameModalState>(POST_PONG_GAME_MODAL_ID);

export const usePostPongGameModalActions = () =>
  useModalActions<PostPongGameModalState>(POST_PONG_GAME_MODAL_ID);
