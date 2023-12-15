import { useSocket } from '@hooks/socket';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import PongModel from '@typings/models/pong';
import { UIGame } from '@views/pong/Game';
import { UIPlayer } from '@views/pong/Paddles/Player';
import React from 'react';

export const useListenerManager = () => {
  const { connected, socket, status, useMounter, emit, useListener } =
    useSocket(buildTunnelEndpoint(PongModel.Endpoints.Targets.Connect));
  useMounter();

  const parentRef = React.useRef<HTMLDivElement>(null);
  const game = React.useRef<UIGame | null>(null);

  useListener(
    PongModel.Socket.Events.SetUI,
    (data: PongModel.Socket.Data.SetUIGame) => {
      if (data)
        game.current = new UIGame(socket, parentRef.current!, data.config);
      else game.current = null;
    }
  );

  useListener(PongModel.Socket.Events.Start, () => {
    if (game?.current?.delta) return;
    console.log(`Room: ${game?.current?.roomId} started playing`);
    game?.current?.start();
  });

  useListener(
    PongModel.Socket.Events.UpdateMovements,
    (data: PongModel.Socket.Data.UpdateMovements[]) => {
      game?.current?.handleMovements(data);
    }
  );

  useListener(
    PongModel.Socket.Events.CreatePower,
    (data: PongModel.Socket.Data.CreatePower) => {
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
    }
  );

  useListener(
    PongModel.Socket.Events.ShootPower,
    (data: PongModel.Socket.Data.ShootPower) => {
      const player = game?.current?.getObjectByTag(data.tag) as UIPlayer;
      if (player) player.shootPower();
    }
  );

  useListener(
    'shooter-update',
    (data: { tag: string; line: { start: number[]; end: number[] } }) => {
      const player = game?.current?.getObjectByTag(data.tag) as UIPlayer;
      if (player) player.updateShooter(data.line);
    }
  );

  useListener(
    PongModel.Socket.Events.RemovePower,
    (data: PongModel.Socket.Data.RemovePower) => {
      data.tag.forEach((tag) => {
        const object = game?.current?.getObjectByTag(tag);
        if (object) game?.current?.handleRemovePower(object);
      });
    }
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
    }
  );

  useListener(
    'score-update',
    (data: { teamId: number; score: [number, number]; scale: number }) => {
      console.log(data.scale);
      game?.current?.updateScore(data.teamId, data.score, data.scale);
    }
  );

  return {
    parentRef,
  };
};
