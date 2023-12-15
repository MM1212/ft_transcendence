import pongGamesState from '@apps/GameLobby/state';
import { useSocket } from '@hooks/socket';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { DialogContent, ModalClose, Typography } from '@mui/joy';
import { Modal, ModalDialog } from '@mui/joy';
import PongModel from '@typings/models/pong';
import { UIGame } from '@views/pong/Game';
import { UIPlayer } from '@views/pong/Paddles/Player';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { useListenerManager } from './events/ListenerManager';

export function OpenGameModal({ isPlaying }: { isPlaying: boolean }) {
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;

  if (lobby === null) return;
  return (
    <>
      <Modal open={isPlaying} onClose={close}>
        <ModalDialog layout="fullscreen">
          <ModalClose />
          <Typography>{lobby.name}</Typography>

          <PongComponent lobby={lobby} />
        </ModalDialog>
      </Modal>
    </>
  );
}

//import Pong from '@views/pong';
function PongComponent({ lobby }: { lobby: PongModel.Models.ILobby }) {
  const { parentRef } = useListenerManager();
  return (
    <>
      <DialogContent ref={parentRef} />
    </>
  );

  //  return connectedPlayers.length !== lobby.nPlayers && game === null ? (
  //    connectedPlayers.map((player) => (
  //      <Typography key={player.userId}>connected: {player.nickname}</Typography>
  //    ))
  //  ) : (
  //    <DialogContent ref={parentRef} />
  //  );
}
