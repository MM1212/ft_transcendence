import { useCurrentUser } from '@hooks/user';
import { DialogContent, Modal, ModalDialog } from '@mui/joy';
import { Typography } from '@mui/joy';
import PongHistoryModel from '@typings/models/pong/history';
import React from 'react';
import { usePostPongGameModal } from './hooks';
import MatchHistoryScoreBoard from '@apps/MatchHistory/components/MatchHistoryScoreBoard';
import MatchHistoryEntryHeader from '@apps/MatchHistory/components/MatchHistoryEntryHeader';

function Content(data: PongHistoryModel.Models.Match) {
  const user = useCurrentUser();

  if (user === null) return;
  return (
    <React.Suspense fallback={<Typography>Loading...</Typography>}>
      <MatchHistoryEntryHeader {...data} targetId={user.id} />
      <MatchHistoryScoreBoard {...data} />
    </React.Suspense>
  );
}

export function PostGameModal() {
  const { close, isOpened, data } = usePostPongGameModal();

  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog layout="center">
        {data.history && <Content {...data.history} />}
      </ModalDialog>
    </Modal>
  );
}
