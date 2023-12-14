import pongGamesState from '@apps/GameLobby/state';
import { useSocket } from '@hooks/socket';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { DialogContent, ModalClose, Typography } from '@mui/joy';
import { Modal, ModalDialog } from '@mui/joy';
import PongModel from '@typings/models/pong';
import { UIGame } from '@views/pong/Game';
import React from 'react';
import { useRecoilValue } from 'recoil';

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
  const { connected, socket, status, useMounter, emit, useListener } =
    useSocket(buildTunnelEndpoint(PongModel.Endpoints.Targets.Connect));

  useMounter();

  const parentRef = React.useRef<HTMLDivElement>(null);
  const game = React.useRef<UIGame | null>(null);
  const [connectedPlayers, setConnectedPlayers] = React.useState<
    PongModel.Models.IPlayerConfig[]
  >([]);

  useListener(
    PongModel.Socket.Events.UpdateConnectedPlayers,
    (data: PongModel.Models.IPlayerConfig[]) => {
      console.log('update connected players', data);
      setConnectedPlayers(data);
    },
  );

  useListener(
    PongModel.Socket.Events.SetUIGame,
    (data: {state: boolean, config: PongModel.Models.IGameConfig}) => {
      if (data) {
        game.current = new UIGame(socket, parentRef.current!, data.config);
      } else {
        game.current = null;
      }
    },
  );

    return (
      <>
      {/* connectedPlayers.map((player) => ( */}
        {/* <Typography key={player.userId}>connected: {player.nickname}</Typography> */}
      
      <DialogContent ref={parentRef} />
      </>
    )

//  return connectedPlayers.length !== lobby.nPlayers && game === null ? (
//    connectedPlayers.map((player) => (
//      <Typography key={player.userId}>connected: {player.nickname}</Typography>
//    ))
//  ) : (
//    <DialogContent ref={parentRef} />
//  );
}
