import { useSocket } from '@hooks/socket';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { Button, List, ListItem, Sheet, Stack } from '@mui/joy';
import { Endpoints } from '@typings/api';
import React from 'react';
import { Pixi, usePixiRenderer } from '@hooks/pixiRenderer';
import { Lobbies } from '@typings/lobby';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import {
  InitdPlayer,
  Player,
  lobbyAppAtom,
  lobbyCurrentPlayerSelector,
  lobbyPlayersAtom,
} from './state';
import { useKeybindsToggle } from '@hooks/keybinds';
import Link from '@components/Link';

const rendererOptions: Partial<Pixi.IApplicationOptions> = {};

const mainTex = Pixi.Texture.from('https://pixijs.com/assets/bunny.png');
const backgroundTex = Pixi.Texture.from(
  buildTunnelEndpoint(Endpoints.LobbyBackground)
);
const initSprite = (app: Pixi.Application, player: InitdPlayer) => {
  player.sprite.x = player.transform.position.x;
  player.sprite.y = player.transform.position.y;
  player.sprite.name = `lobby/${player.user.id}-${player.user.nickname}`;
  app.stage.addChild(player.sprite);
};

export default function Lobby() {
  const { status, useMounter, emit, useListener } = useSocket(
    buildTunnelEndpoint(Endpoints.LobbySocket)
  );

  const loadData = useRecoilCallback(
    (ctx) => async (data: Lobbies.Packets.LoadData) => {
      const app = await ctx.snapshot.getPromise(lobbyAppAtom);
      if (!app)
        return ctx.set(
          lobbyPlayersAtom,
          data.players.map((player) => ({ ...player, sprite: null }))
        );
      const players = data.players.map<InitdPlayer>((player) => ({
        ...player,
        sprite: new Pixi.Sprite(mainTex),
      }));
      players.forEach((player) => initSprite(app, player));
      ctx.set(lobbyPlayersAtom, players);
    },
    []
  );

  const newPlayer = useRecoilCallback(
    (ctx) => async (data: Lobbies.Packets.NewPlayer) => {
      const { player }: { player: Player } = data as { player: Player };
      const app = await ctx.snapshot.getPromise(lobbyAppAtom);
      console.log('BOAS', player, app);

      if (!app)
        return ctx.set(lobbyPlayersAtom, (prev) => [
          ...prev,
          { ...player, sprite: null },
        ]);
      player.sprite = new Pixi.Sprite(mainTex);
      initSprite(app, player as InitdPlayer);
      ctx.set(lobbyPlayersAtom, (prev) => [...prev, player]);
      console.log('BOAS2', player, app);
    },
    []
  );

  const setPlayers = useRecoilCallback(
    (ctx) => async (data: Lobbies.Packets.LoadData) => {
      const app = await ctx.snapshot.getPromise(lobbyAppAtom);
      ctx.set(lobbyPlayersAtom, (prev) =>
        prev
          .map((player) => {
            const newData = data.players.find(
              (p) => p.user.id === player.user.id
            );
            if (!newData) return player;
            return { ...player, ...newData };
          })
          .map((player) => {
            if (!app || !player.sprite) return player;
            player.sprite.x = player.transform.position.x;
            player.sprite.y = player.transform.position.y;
            return player;
          })
      );
    },
    []
  );

  const removePlayer = useRecoilCallback(
    (ctx) =>
      async ({ id }: Lobbies.Packets.RemovePlayer) => {
        const app = await ctx.snapshot.getPromise(lobbyAppAtom);
        ctx.set(lobbyPlayersAtom, (prev) =>
          prev.filter((p) => {
            if (p.user.id !== id) return true;
            if (!app || !p.sprite) return false;
            app.stage.removeChild(p.sprite);
            return false;
          })
        );
      },
    []
  );

  const updatePlayersTransform = useRecoilCallback(
    (ctx) =>
      async ({ players }: Lobbies.Packets.UpdatePlayersTransform) => {
        const app = await ctx.snapshot.getPromise(lobbyAppAtom);
        ctx.set(lobbyPlayersAtom, (prev) =>
          prev.map((player) => {
            const data = players.find((p) => player.user.id === p.id);
            if (!data) return player;
            if (data.position) player.transform.position = data.position;
            if (data.velocity) player.transform.velocity = data.velocity;
            if (!app || !player.sprite) return player;
            player.sprite.x = player.transform.position.x;
            player.sprite.y = player.transform.position.y;
            return player;
          })
        );
      },
    []
  );

  useListener(Lobbies.Packets.Events.LoadData, loadData);
  useListener(Lobbies.Packets.Events.NewPlayer, newPlayer);
  useListener(Lobbies.Packets.Events.SetPlayers, setPlayers);
  useListener(Lobbies.Packets.Events.RemovePlayer, removePlayer);
  useListener(
    Lobbies.Packets.Events.UpdatePlayersTransform,
    updatePlayersTransform
  );

  useMounter();

  useListener('connect', () => console.log('connected'));
  useListener('disconnect', () => console.log('disconnected'));

  const ref = React.useRef<HTMLDivElement>(null);

  const onAppMount = useRecoilCallback(
    (ctx) => async (app: Pixi.Application) => {
      const background = new Pixi.Sprite(backgroundTex);
      background.width = app.view.width;
      background.height = app.view.height;
      app.stage.addChild(background);
      ctx.set(lobbyAppAtom, app);
      const players = await ctx.snapshot.getPromise(lobbyPlayersAtom);
      for (const player of players) {
        if (player.sprite) continue;
        player.sprite = new Pixi.Sprite(mainTex);
        initSprite(app, player as InitdPlayer);
      }
      app.ticker.maxFPS = 60;
      app.ticker.minFPS = 60;
      return () => {
        ctx.set(lobbyAppAtom, null);
      };
    },
    []
  );
  usePixiRenderer(ref, onAppMount, rendererOptions);
  const onBindToggle = useRecoilCallback(
    (ctx) => async (key, pressed) => {
      console.log('update-velocity', { key, pressed });
      const player = await ctx.snapshot.getPromise(lobbyCurrentPlayerSelector);
      if (!player || !player.sprite) return;
      emit('update-velocity', { key, pressed });
      switch (key) {
        case 'KeyA':
          player.transform.velocity.x = pressed ? -1 : 0;
          break;
        case 'KeyD':
          player.transform.velocity.x = pressed ? 1 : 0;
          break;
        case 'KeyW':
          player.transform.velocity.y = pressed ? -1 : 0;
          break;
        case 'KeyS':
          player.transform.velocity.y = pressed ? 1 : 0;
          break;
      }
      player.sprite.x = player.transform.position.x;
      player.sprite.y = player.transform.position.y;
    },
    [emit]
  );
  useKeybindsToggle(['KeyW', 'KeyA', 'KeyS', 'KeyD'], onBindToggle, []);

  return (
    <>
      <div
        style={{
          width: '100vw',
          height: '100vh',
        }}
        ref={ref}
      />
      <Button component={Link} href="/" variant="soft">
        Back
      </Button>
    </>
  );
}
