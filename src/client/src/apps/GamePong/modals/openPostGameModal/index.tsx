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
  const teamWon = data.teams[data.winnerTeamId];
  const hasPlayer = teamWon.players.some((p) => p.userId === user.id);
  const winLose = hasPlayer ? 'won' : 'lost';
  return (
    <>
      <Typography>You {winLose}!</Typography>
      <React.Suspense fallback={<Typography>Loading...</Typography>}>
        <MatchHistoryEntryHeader {...data} targetId={user.id} />
        <MatchHistoryScoreBoard {...data} />
      </React.Suspense>
    </>
  );
}

export function PostGameModal() {
  const { close, isOpened, data } = usePostPongGameModal();
  console.log('ponggamemodal', data);


  return (
    <>
      <Modal open={isOpened} onClose={close}>
        <ModalDialog layout="center">
          <DialogContent>
            {data.history && <Content {...data.history} />}
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
}
