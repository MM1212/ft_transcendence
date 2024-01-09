import pongGamesState from "@apps/GameLobby/state";
import { useSocket } from "@hooks/socket";
import { buildTunnelEndpoint } from "@hooks/tunnel";
import { useCurrentUser } from "@hooks/user";
import PongModel from "@typings/models/pong";
import PongHistoryModel from "@typings/models/pong/history";
import { UIGame } from "@views/pong/Game";
import { UIPlayer } from "@views/pong/Paddles/Player";
import React from "react";
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from "recoil";
import { navigate } from "wouter/use-location";
import { usePostPongGameModalActions } from "../modals/openPostGameModal/hooks";


export const useListenerManager = () => {
  const { connected, socket, status, useMounter, emit, useListener } =
    useSocket(buildTunnelEndpoint(PongModel.Endpoints.Targets.Connect));
  useMounter();

  const parentRef = React.useRef<HTMLDivElement>(null);
  const [alreadyConnected, setAlreadyConnected] = React.useState(false);
  const game = React.useRef<UIGame | null>(null);
  const setIsPlaying = useSetRecoilState(pongGamesState.isPlaying);
  const {open} = usePostPongGameModalActions();
  const user  = useCurrentUser()!;

  useListener(
    PongModel.Socket.Events.SetUI,
    (data: PongModel.Socket.Data.SetUIGame) => {
      if (data) {
        game.current = new UIGame(socket, parentRef.current!, data.config, user.nickname);
        console.log(`${user.nickname}`)
        if (data.state) {
          game.current.start();
        }
      } else {
        game.current = null;
      }
    }, [game]
  );

  const onStop = useRecoilCallback(ctx => async (data: PongHistoryModel.Models.Match) => {
    console.log(`Room: ${game?.current?.roomId} stopped playing`);
    game?.current?.gameOver();
    console.log(data);
    const release = ctx.snapshot.retain();
    open({history: data});
    setTimeout(() => {
      setIsPlaying(false);
      ctx.set(pongGamesState.gameLobby, null);
      navigate("/");
      release();
    }, 3000);
  }, [open, setIsPlaying]);

  useListener(PongModel.Socket.Events.Stop, onStop, []);

  useListener(PongModel.Socket.Events.Start, () => {
    if (game?.current?.delta) return;
    console.log(`Room: ${game?.current?.roomId} started playing`);
    game?.current?.start();
  });

  useListener(
    PongModel.Socket.Events.UpdateMovements,
    (data: PongModel.Socket.Data.UpdateMovements[]) => {
      game?.current?.handleMovements(data);
    }, [game]
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
    }, [game]
  );

  useListener(
    PongModel.Socket.Events.ShootPower,
    (data: PongModel.Socket.Data.ShootPower) => {
      const player = game?.current?.getObjectByTag(data.tag) as UIPlayer;
      if (player) player.shootPower();
    }, [game]
  );

  useListener(
    PongModel.Socket.Events.UpdateShooter,
    (data: PongModel.Socket.Data.UpdateShooter) => {
      const player = game?.current?.getObjectByTag(data.tag) as UIPlayer;
      if (player) player.updateShooter(data.line);
    }, [game]
  );

  useListener(
    PongModel.Socket.Events.RemovePower,
    (data: PongModel.Socket.Data.RemovePower) => {
      data.tag.forEach((tag) => {
        const object = game?.current?.getObjectByTag(tag);
        if (object) game?.current?.handleRemovePower(object);
      });
    }, [game]
  );

  useListener(
    PongModel.Socket.Events.EffectCreateRemove,
    (data: PongModel.Socket.Data.EffectCreateRemove[]) => {
      data.forEach((effect) => {
        console.log(
          effect.tag + " has " + effect.effectName + " " + effect.option
        );
        const object = game?.current?.getObjectByTag(effect.tag);
        if (object)
          game?.current?.handleEffect(object, effect.effectName, effect.option);
      });
    }, [game]
  );

  useListener(
    PongModel.Socket.Events.UpdatePaddleSizes,
    (data: PongModel.Socket.Data.UpdatePaddleSizes) => {
      game?.current?.updatePaddleSizes(data.paddles);
    }, [game]
  )

  useListener(
    PongModel.Socket.Events.UpdateScore,
    (data: PongModel.Socket.Data.UpdateScore) => {
      game?.current?.updateScore(data.score, data.paddles);
    }, [game]
  );

  useListener(
    PongModel.Socket.Events.UpdateDisconnected,
    (data: PongModel.Socket.Data.UpdateDisconnected) => {
      console.log(data);
      if (data.userIds.length === 0) return;
      game?.current?.updateDisconnectedRefresh(data.userIds);
    }, [game]
  )

  useListener(
    PongModel.Socket.Events.Disconnected,
    (data: PongModel.Socket.Data.Disconnected) => {
      game?.current?.updateDisconnected(data.nickname, data.tag);
    }, [game]
  );
  useListener(
    PongModel.Socket.Events.Reconnected,
    (data: PongModel.Socket.Data.Reconnected) => {
      console.log(data);
      game?.current?.updateReconnected(data.nickname, data.tag);
    }, [game]
  );

  useListener(PongModel.Socket.Events.AlreadyConnected, () => {
    setAlreadyConnected(true);
  }, [setAlreadyConnected]);

  return {
    parentRef,
    alreadyConnected,
  };
};
