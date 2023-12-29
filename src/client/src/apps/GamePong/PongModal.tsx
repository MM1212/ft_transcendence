import pongGamesState from "@apps/GameLobby/state";
import { ModalClose, Typography } from "@mui/joy";
import { Modal, ModalDialog } from "@mui/joy";
import PongModel from "@typings/models/pong";
import React from "react";
import { useRecoilValue } from "recoil";
import { useListenerManager } from "./events/ListenerManager";

export function OpenGameModal({ isPlaying }: { isPlaying: boolean }) {
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;

  if (lobby === null) return;
  return (
    <>
      <Modal open={isPlaying} onClose={close}>
        <ModalDialog layout="fullscreen">
          <ModalClose />
          <Typography>Room: {lobby.name}</Typography>

          <PongComponent lobby={lobby} />
        </ModalDialog>
      </Modal>
    </>
  );
}

//import Pong from '@views/pong';
function PongComponent({ lobby }: { lobby: PongModel.Models.ILobby }) {
  const { parentRef, alreadyConnected } = useListenerManager();

  const mountRef = React.useMemo(() => <div ref={parentRef} />, [parentRef]);

  return alreadyConnected ? (
    <Typography>You are already connected, either close the other browser or play on it!</Typography>
  ) : (
    <>{mountRef}</>
  );

  //  return connectedPlayers.length !== lobby.nPlayers && game === null ? (
  //    connectedPlayers.map((player) => (
  //      <Typography key={player.userId}>connected: {player.nickname}</Typography>
  //    ))
  //  ) : (
  //    <DialogContent ref={parentRef} />
  //  );
}
