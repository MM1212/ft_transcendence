import { useSocket } from '@hooks/socket';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import React from 'react';
import { Pixi, usePixiRenderer } from '@hooks/pixiRenderer';
import { Lobbies } from '@typings/lobby';
import { useRecoilCallback } from 'recoil';
import {
  InitdPlayer,
  Player,
  PlayerLayers,
  allowPlayerFocus,
  allowPlayerMove,
  lobbyAppAtom,
  lobbyCurrentPlayerSelector,
  lobbyPlayersAtom,
} from '@/apps/Lobby/state';
import { useKeybindsToggle } from '@hooks/keybinds';
import LobbyModel from '@typings/models/lobby';
import { sessionAtom } from '@hooks/user';
import ChatBox from '@apps/Lobby/components/InGameChat';

const buildAnimation = (assetName: string) =>
  [...new Array(8)].map((_, i) =>
    Pixi.Texture.from(`${assetName}/12_${i + 1}`)
  );

const loadPenguin = async (self: boolean) => {
  const center = (sprite: Pixi.Sprite) => {
    sprite.anchor.set(0.5);
    sprite.x = 0;
    sprite.y = 0;
  };
  await Pixi.Assets.load([
    '/penguin/base/asset.json',
    '/penguin/body/asset.json',
    '/penguin/clothing/258/asset.json',
    '/penguin/clothing/231/asset.json',
    '/penguin/clothing/374/asset.json',
    '/penguin/clothing/490/asset.json',
    '/penguin/clothing/497/asset.json',
    '/penguin/clothing/138/asset.json',
    '/penguin/clothing/195/asset.json',
  ]);
  const layers: PlayerLayers = {} as PlayerLayers;
  layers.container = new Pixi.Container();
  layers.container.name = 'penguin';
  layers.baseShadow = new Pixi.Sprite(Pixi.Texture.from('base/shadow'));
  center(layers.baseShadow);
  if (self) {
    layers.base = new Pixi.Sprite(Pixi.Texture.from('base/ring'));
    center(layers.base);
  }
  layers.belly = new Pixi.AnimatedSprite(buildAnimation('body'));
  center(layers.belly);
  layers.belly.tint = 0x00ffff;
  layers.belly.animationSpeed = 0.3;
  layers.fixtures = new Pixi.AnimatedSprite(buildAnimation('penguin'));
  center(layers.fixtures);
  layers.fixtures.animationSpeed = 0.3;
  layers.clothing = {
    glasseds: new Pixi.AnimatedSprite(buildAnimation('138')),
    boots: new Pixi.AnimatedSprite(buildAnimation('374')),
    shirt: new Pixi.AnimatedSprite(buildAnimation('258')),
    belt: new Pixi.AnimatedSprite(buildAnimation('231')),
    hat: new Pixi.AnimatedSprite(buildAnimation('497')),
    camera: new Pixi.AnimatedSprite(buildAnimation('195')),
  };
  Object.values(layers.clothing).forEach((cloth) => {
    center(cloth);
    cloth.animationSpeed = 0.3;
  });
  layers.container.addChild(layers.baseShadow);
  if (layers.base) layers.container.addChild(layers.base);
  layers.container.addChild(
    layers.belly,
    layers.fixtures,
    ...Object.values(layers.clothing)
  );
  const animatedLayers = [
    layers.belly,
    layers.fixtures,
    ...Object.values(layers.clothing),
  ];
  animatedLayers.forEach((layer) => layer.gotoAndPlay(0));
  return layers;
};

const initSprite = (app: Pixi.Application, player: InitdPlayer) => {
  player.nickNameText.x = 10;
  player.nickNameText.y = -20;
  player.nickNameText.anchor.set(0.5);
  // player.layers.container.addChild(player.nickNameText);
  app.stage.addChild(player.layers.container);
  // Set the name property to identify the text later if needed
};

export default function Lobby() {
  const { useMounter, emit, useListener } = useSocket(
    buildTunnelEndpoint(LobbyModel.Endpoints.Targets.Connect)
  );
  const loadData = useRecoilCallback(
    (ctx) => async (data: Lobbies.Packets.LoadData) => {
      const app = await ctx.snapshot.getPromise(lobbyAppAtom);
      const self = await ctx.snapshot.getPromise(sessionAtom);
      if (!app || !self)
        return ctx.set(
          lobbyPlayersAtom,
          data.players.map((player) => ({
            ...player,
            layers: null,
            nickNameText: null,
            allowMove: true,
          }))
        );

      const players = await Promise.all(
        data.players.map<Promise<InitdPlayer>>(async (player) => ({
          ...player,
          layers: await loadPenguin(player.user.id === self.id),
          nickNameText: new Pixi.Text(player.user.nickname, {
            fontFamily: 'Inter',
            dropShadow: true,
            dropShadowDistance: 2,
            dropShadowAngle: 1,
            dropShadowAlpha: 1,
            dropShadowColor: '#000',
            stroke: '#000',
            strokeThickness: 1,
            fontSize: 12,
            align: 'center',
            fill: '#fef08a',
          }),
          allowMove: true,
        }))
      );
      players.forEach((player) => initSprite(app, player));
      ctx.set(lobbyPlayersAtom, players);
    },
    []
  );

  const newPlayer = useRecoilCallback(
    (ctx) => async (data: Lobbies.Packets.NewPlayer) => {
      const { player }: { player: Player } = data as { player: Player };
      const app = await ctx.snapshot.getPromise(lobbyAppAtom);
      if (!app)
        return ctx.set(lobbyPlayersAtom, (prev) => [
          ...prev,
          { ...player, sprite: null },
        ]);
      player.layers = await loadPenguin(false);
      player.nickNameText = new Pixi.Text(player.user.nickname, {
        fontFamily: 'Inter',
        dropShadow: true,
        fontSize: 16,
        align: 'center',
        fill: '#fef08a',
        fontWeight: 'bold',
      });
      initSprite(app, player as InitdPlayer);
      ctx.set(lobbyPlayersAtom, (prev) => [...prev, player]);
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
            if (!app || !player.layers) return player;
            player.layers.container.x = player.transform.position.x;
            player.layers.container.y = player.transform.position.y;
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
            if (!app || !p.layers) return false;
            app.stage.removeChild(p.layers.container);
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
            if (!app || !player.layers) return player;
            player.layers.container.x = player.transform.position.x;
            player.layers.container.y = player.transform.position.y;
            return player;
          })
        );
      },
    []
  );

  useListener(LobbyModel.Socket.Messages.LoadData, loadData);
  useListener(LobbyModel.Socket.Messages.NewPlayer, newPlayer);
  useListener(LobbyModel.Socket.Messages.SetPlayers, setPlayers);
  useListener(LobbyModel.Socket.Messages.RemovePlayer, removePlayer);
  useListener(
    LobbyModel.Socket.Messages.UpdatePlayersTransform,
    updatePlayersTransform
  );

  useMounter();

  useListener('connect', () => console.log('connected'));
  useListener('disconnect', () => console.log('disconnected'));

  const ref = React.useRef<HTMLDivElement>(null);

  const onAppMount = useRecoilCallback(
    (ctx) => async (app: Pixi.Application) => {
      const backgroundTex = await Pixi.Texture.fromURL(
        LobbyModel.Endpoints.Targets.StaticBackground
      );
      const background = new Pixi.Sprite(backgroundTex);
      background.x = 0;
      background.y = 0;
      background.width = app.screen.width;
      background.height = app.screen.height;

      app.stage.addChild(background);
      ctx.set(lobbyAppAtom, app);
      const players = await ctx.snapshot.getPromise(lobbyPlayersAtom);
      const self = await ctx.snapshot.getPromise(sessionAtom);
      if (!players || !self) return () => ctx.set(lobbyAppAtom, null);
      for (const player of players) {
        if (player.layers) continue;
        player.layers = await loadPenguin(player.user.id === self.id);
        player.nickNameText = new Pixi.Text(player.user.nickname, {
          fontFamily: 'Inter',
          dropShadow: true,
          dropShadowDistance: 2,
          dropShadowAngle: 1,
          dropShadowAlpha: 1,
          dropShadowColor: '#000',
          fontSize: 12,
          align: 'center',
          fill: '#fef08a',
        });
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

  const rendererOptions: Partial<Pixi.IApplicationOptions> = React.useMemo(
    () => ({
      antialias: true,
      resizeTo: window,
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    }),
    []
  );

  usePixiRenderer(ref, onAppMount, rendererOptions);
  const onBindToggle = useRecoilCallback(
    (ctx) => async (key, pressed) => {
      const player = await ctx.snapshot.getPromise(lobbyCurrentPlayerSelector);
      const allowMove = await ctx.snapshot.getPromise(allowPlayerMove);
      const allowFocus = await ctx.snapshot.getPromise(allowPlayerFocus);
      if (allowMove === true) return;
      if (allowFocus === true) return;
      if (!player || !player.layers) return;
      if (player.allowMove === false) return;
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
      player.layers.container.x = player.transform.position.x;
      player.layers.container.y = player.transform.position.y;
    },
    [emit]
  );
  useKeybindsToggle(['KeyW', 'KeyA', 'KeyS', 'KeyD'], onBindToggle, []);

  return React.useMemo(
    () => (
      <div
        style={{
          height: '100dvh',
          width: '100dvw',
          display: 'flex',
        }}
        ref={ref}
      >
        {/* <Sidebar /> */}
        <ChatBox />
      </div>
    ),
    []
  );
}
