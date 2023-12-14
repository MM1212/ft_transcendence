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
/** OLD CODE */
  useListener(
    'STARTMOVING',
    () => {
      if (game?.current?.delta) return;
      console.log(`Room: ${game?.current?.roomId}`);
      game?.current?.start();
    },
    [game]
  );

  useListener(
    'movements',
    (data: { tag: string; position: number[] }[]) => {
      game?.current?.handleMovements(data);
    },
    [game]
  );

  useListener(
    'create-power',
    (data: { tag: string; powertag: string }) => {
      const player = game?.current?.getObjectByTag(data.tag) as UIPlayer;
      let power;
      if (player)
        power = player?.createPower(
          player.specialPower,
          player.getCenter,
          player.direction.x,
          player,
          data.powertag
        );
      if (power) {
        game?.current?.add(power);
      }
    },
    [game]
  );

  useListener(
    'shoot-power',
    (data: { tag: string }) => {
      const player = game?.current?.getObjectByTag(data.tag) as UIPlayer;
      if (player) player.shootPower();
    },
    [game]
  );

  useListener(
    'shooter-update',
    (data: { tag: string; line: { start: number[]; end: number[] } }) => {
      const player = game?.current?.getObjectByTag(data.tag) as UIPlayer;
      if (player) player.updateShooter(data.line);
    },
    [game]
  );

  useListener(
    'remove-power',
    (data: { tag: string[] }) => {
      data.tag.forEach((tag) => {
        const object = game?.current?.getObjectByTag(tag);
        if (object) game?.current?.handleRemovePower(object);
      });
    },
    [game]
  );

  useListener(
    'effect-create-remove',
    (
      data: { tag: string; effectName: string | undefined; option: number }[]
    ) => {
      data.forEach((effect) => {
        console.log(
          effect.tag + ' has ' + effect.effectName + ' ' + effect.option
        );
        const object = game?.current?.getObjectByTag(effect.tag);
        if (object)
          game?.current?.handleEffect(object, effect.effectName, effect.option);
      });
    },
    [game]
  );

  useListener(
    'score-update',
    (data: { teamId: number; score: [number, number]; scale: number }) => {
      console.log(data.scale);
      game?.current?.updateScore(data.teamId, data.score, data.scale);
    },
    [game]
  );

    return (
      <>
        {connectedPlayers.map((player) => (
          <Typography key={player.userId}>connected: {player.nickname}</Typography>
        ))}
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
