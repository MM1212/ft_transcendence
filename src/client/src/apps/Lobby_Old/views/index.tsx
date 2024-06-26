import { useSocket } from '@hooks/socket';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import React from 'react';
import { Pixi, usePixiRenderer } from '@hooks/pixiRenderer';
import { Viewport } from 'pixi-viewport';
import { Lobbies } from '@typings/lobby';
import { useRecoilCallback } from 'recoil';
import {
  InitdPlayer,
  Player,
  PlayerLayers,
  enablePlayerInput,
  lobbyAppAtom,
  lobbyCurrentPlayerSelector,
  lobbyPlayersAtom,
  setupAnimation,
  switchToAnimation,
} from '@apps/Lobby_Old/state';
import { useKeybindsToggle } from '@hooks/keybinds';
import DEPRECATED_LobbyModel from '@typings/models/lobby_old';
import { sessionAtom, useIsLoggedIn, usersAtom } from '@hooks/user';
import ChatBox from '@apps/Lobby/components/InGameChat';
import {
  inventoryAtom,
  penguinClothingPriority,
  penguinColorPalette,
} from '@apps/Customization/state';
import penguinState, {
  AnimationConfigSet,
  animationConfig,
} from '@apps/penguin/state';
import {
  IPenguinBaseAnimationsTypes,
  TPenguinAnimationDirection,
} from '@typings/penguin';
import publicPath from '@utils/public';

export default function Lobby() {
  const { useMounter, emit, useListener } = useSocket(
    buildTunnelEndpoint(DEPRECATED_LobbyModel.Endpoints.Targets.Connect)
  );

  const isLoggedIn = useIsLoggedIn();

  const initSprite = useRecoilCallback(
    (ctx) =>
      async (app: Pixi.Application, player: InitdPlayer, isSelf: boolean) => {
        player.nickNameText.x = 0;
        player.nickNameText.y = 10;
        player.nickNameText.anchor.set(0.5, -0.5);
        player.nickNameText.zIndex = 999;
        player.layers.container.x = player.transform.position.x;
        player.layers.container.y = player.transform.position.y;
        player.layers.container.addChild(player.nickNameText);

        const viewport = app.stage.getChildByName('viewport') as Viewport;
        if (isSelf) {
          player.layers.container.name = 'self';
          viewport.scale.set(0.1);
          viewport.follow(player.layers.container);
        }
        viewport.addChild(player.layers.container);

        await switchToAnimation(
          player,
          player.currentAnimation,
          await ctx.snapshot.getPromise(inventoryAtom),
          ctx.snapshot,
          true
        );
      },
    []
  );
  const loadPenguin = useRecoilCallback(
    (ctx) => async (player: Lobbies.IPlayer, self: boolean) => {
      const center = (sprite: Pixi.Sprite) => {
        sprite.anchor.set(0.5);
        sprite.x = 0;
        sprite.y = 0;
      };
      const inventory = await ctx.snapshot.getPromise(inventoryAtom);
      const { color, ...selected } = inventory.selected;

      if (!Pixi.Cache.has('base/shadow'))
        await Pixi.Assets.load(
          ['/penguin/base/asset.json', '/penguin/body/asset.json'].map(
            publicPath
          )
        );

      const layers: PlayerLayers = {} as PlayerLayers;
      layers.container = new Pixi.Container();
      layers.container.name = 'penguin';
      layers.container.sortableChildren = true;
      layers.container.scale.set(1.5);
      layers.baseShadow = new Pixi.Sprite(Pixi.Texture.from('base/shadow'));
      center(layers.baseShadow);
      if (self) {
        layers.base = new Pixi.Sprite(Pixi.Texture.from('base/ring'));
        center(layers.base);
      }
      layers.belly = new Pixi.AnimatedSprite(
        (await ctx.snapshot.getPromise(penguinState.baseAnimations('body')))[
          'idle/down'
        ]
      );
      center(layers.belly);
      layers.belly.tint =
        penguinColorPalette[
          color.toString() as keyof typeof penguinColorPalette
        ];
      layers.belly.animationSpeed = 0.3;
      layers.fixtures = new Pixi.AnimatedSprite(
        (await ctx.snapshot.getPromise(penguinState.baseAnimations('penguin')))[
          'idle/down'
        ]
      );
      center(layers.fixtures);
      layers.fixtures.animationSpeed = 0.3;

      const clothingTextures = await Promise.all(
        (Object.keys(selected) as (keyof typeof selected)[])
          .filter((piece) => inventory.selected[piece] !== -1)
          .map(async (piece) => {
            const sprite = new Pixi.AnimatedSprite(
              (
                await ctx.snapshot.getPromise(
                  penguinState.baseAnimations(selected[piece].toString())
                )
              )['idle/down']
            );
            sprite.name = piece;
            sprite.zIndex = penguinClothingPriority[piece];
            return sprite;
          })
      );
      layers.clothing = clothingTextures.reduce(
        (acc, clothPiece) => {
          acc[clothPiece.name!] = clothPiece;
          return acc;
        },
        {} as Record<string, Pixi.AnimatedSprite>
      );
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
      animatedLayers.forEach((layer) =>
        setupAnimation(layer, player.currentAnimation)
      );
      return layers;
    },
    []
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
        data.players.map<Promise<InitdPlayer>>(async (player) => {
          const user =
            player.userId === self.id
              ? self
              : (await ctx.snapshot.getPromise(usersAtom(player.userId)))!;
          return {
            ...player,
            layers: await loadPenguin(player, player.userId === self.id),
            nickNameText: new Pixi.Text(user.nickname, {
              fontFamily: 'monospace',
              dropShadow: true,
              dropShadowDistance: 2,
              dropShadowAngle: 1,
              dropShadowAlpha: 1,
              dropShadowColor: '#000',
              stroke: '#000',
              strokeThickness: 1,
              fontSize: 14,
              align: 'center',
              fill: '#ffffff',
            }),
            allowMove: true,
          };
        })
      );
      players.forEach((player) =>
        initSprite(app, player, player.userId === self.id)
      );
      ctx.set(lobbyPlayersAtom, players);
    },
    [initSprite, loadPenguin]
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
      const user = (await ctx.snapshot.getPromise(usersAtom(player.userId)))!;
      player.layers = await loadPenguin(player, false);
      player.nickNameText = new Pixi.Text(user.nickname, {
        fontFamily: 'Inter',
        dropShadow: true,
        fontSize: 16,
        align: 'center',
        fill: '#fef08a',
        fontWeight: 'bold',
      });
      initSprite(app, player as InitdPlayer, false);
      ctx.set(lobbyPlayersAtom, (prev) => [...prev, player]);
    },
    [initSprite, loadPenguin]
  );

  const setPlayers = useRecoilCallback(
    (ctx) => async (data: Lobbies.Packets.LoadData) => {
      const app = await ctx.snapshot.getPromise(lobbyAppAtom);
      ctx.set(lobbyPlayersAtom, (prev) =>
        prev
          .map((player) => {
            const newData = data.players.find(
              (p) => p.userId === player.userId
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
            if (p.userId !== id) return true;
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
        const inventory = await ctx.snapshot.getPromise(inventoryAtom);
        ctx.set(lobbyPlayersAtom, (prev) =>
          prev.map((player) => {
            const data = players.find((p) => player.userId === p.id);
            if (!data) return player;
            if (data.position) player.transform.position = data.position;
            if (data.direction) player.transform.direction = data.direction;
            if (!app || !player.layers) return player;
            if (data.newAnim)
              switchToAnimation(player, data.newAnim, inventory, ctx.snapshot);
            player.layers.container.x = player.transform.position.x;
            player.layers.container.y = player.transform.position.y;
            return player;
          })
        );
      },
    []
  );

  useListener(DEPRECATED_LobbyModel.Socket.Messages.LoadData, loadData);
  useListener(DEPRECATED_LobbyModel.Socket.Messages.NewPlayer, newPlayer);
  useListener(DEPRECATED_LobbyModel.Socket.Messages.SetPlayers, setPlayers);
  useListener(DEPRECATED_LobbyModel.Socket.Messages.RemovePlayer, removePlayer);
  useListener(
    DEPRECATED_LobbyModel.Socket.Messages.UpdatePlayersTransform,
    updatePlayersTransform
  );

  useMounter(isLoggedIn);

  useListener('connect', () => console.log('connected'));
  useListener('disconnect', () => console.log('disconnected'));

  const ref = React.useRef<HTMLDivElement>(null);
  const onAppMount = useRecoilCallback(
    (ctx) => async (app: Pixi.Application) => {
      console.log('lobby mounted');

      const viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: DEPRECATED_LobbyModel.Models.STAGE_WIDTH,
        worldHeight: DEPRECATED_LobbyModel.Models.STAGE_HEIGHT,
        events: app.renderer.events,
        ticker: app.ticker,
      });
      viewport.name = 'viewport';
      viewport.clamp({ direction: 'all' });
      viewport.clampZoom({
        maxWidth: DEPRECATED_LobbyModel.Models.STAGE_WIDTH,
        maxHeight: DEPRECATED_LobbyModel.Models.STAGE_HEIGHT,
      });
      viewport.moveCenter(DEPRECATED_LobbyModel.Models.STAGE_WIDTH / 2, 0);

      app.stage.sortableChildren = true;
      const backgroundTex = await Pixi.Texture.fromURL(
        DEPRECATED_LobbyModel.Endpoints.Targets.StaticBackground
      );
      const background = new Pixi.Sprite(backgroundTex);
      background.name = 'background';
      background.x = 0;
      background.y = 0;

      viewport.addChild(background);
      app.stage.addChild(viewport);

      // const walkableMaskTex = await Pixi.Texture.fromURL(
      //   LobbyModel.Endpoints.Targets.WalkableMask
      // );
      // const walkableMask = new Pixi.Sprite(walkableMaskTex);
      // walkableMask.name = 'walkableMask';
      // walkableMask.x = 0;
      // walkableMask.y = 0;
      // walkableMask.alpha = 0.5;
      // app.stage.addChild(walkableMask);
      ctx.set(lobbyAppAtom, app);
      const players = await ctx.snapshot.getPromise(lobbyPlayersAtom);
      const self = await ctx.snapshot.getPromise(sessionAtom);
      if (!players || !self) return () => ctx.set(lobbyAppAtom, null);
      for (const player of players) {
        if (player.layers) continue;
        const user =
          player.userId === self.id
            ? self
            : (await ctx.snapshot.getPromise(usersAtom(player.userId)))!;
        player.layers = await loadPenguin(player, player.userId === self.id);
        player.nickNameText = new Pixi.Text(user.nickname, {
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
        initSprite(app, player as InitdPlayer, player.userId === self.id);
      }
      app.ticker.maxFPS = 60;
      app.ticker.minFPS = 60;
      return () => {
        ctx.set(lobbyAppAtom, null);
      };
    },
    [initSprite, loadPenguin]
  );

  const rendererOptions: Partial<Pixi.IApplicationOptions> = React.useMemo(
    () => ({
      antialias: true,
      backgroundColor: 0x000,
    }),
    []
  );

  usePixiRenderer(ref, onAppMount, rendererOptions);

  const resetToNextAnimation = useRecoilCallback(
    (ctx) => async (player: Player) => {
      if (!player.layers) return;
      const { next } = animationConfig[
        player.currentAnimation
      ] as AnimationConfigSet;
      if (!next) return;
      const inventory = await ctx.snapshot.getPromise(inventoryAtom);
      await switchToAnimation(player, next, inventory, ctx.snapshot);
    },
    []
  );

  const onBindToggle = useRecoilCallback(
    (ctx) => async (key, pressed) => {
      const player = await ctx.snapshot.getPromise(lobbyCurrentPlayerSelector);
      const hasInput = await ctx.snapshot.getPromise(enablePlayerInput);
      if (!hasInput) return;
      if (!player || !player.layers) return;
      if (player.allowMove === false) return;
      const onMoveChange = async (
        type: 'idle' | 'walk',
        dir: TPenguinAnimationDirection
      ) => {
        if (!player || !player.layers) return;
        switchToAnimation(
          player,
          `${type}/${dir}`,
          await ctx.snapshot.getPromise(inventoryAtom),
          ctx.snapshot
        );
      };
      const toggleDance = async () => {
        if (!player || !player.layers) return;
        emit('lobby:toggle-dance');
        switchToAnimation(
          player,
          player.currentAnimation === 'dance' ? 'idle/down' : 'dance',
          await ctx.snapshot.getPromise(inventoryAtom),
          ctx.snapshot
        );
      };
      const throwSnowball = async () => {
        if (
          !player ||
          !player.layers ||
          player.currentAnimation.split('/')[0] !== 'idle'
        )
          return;
        let dir = player.currentAnimation.split('/')[1];
        if (!dir.includes('-')) {
          switch (dir as 'down' | 'left' | 'top' | 'right') {
            case 'down':
              dir = 'down-right';
              break;
            case 'left':
              dir = 'top-left';
              break;
            case 'top':
              dir = 'top-right';
              break;
            case 'right':
              dir = 'down-right';
              break;
          }
        }
        emit('lobby:update-animation', { anim: `snowball/${dir}` });
        await switchToAnimation(
          player,
          `snowball/${dir}` as IPenguinBaseAnimationsTypes,
          await ctx.snapshot.getPromise(inventoryAtom),
          ctx.snapshot
        );
        player.layers.fixtures.onComplete = () => resetToNextAnimation(player);
      };
      switch (key) {
        case 'KeyA':
          player.transform.direction.x = pressed ? -1 : 0;
          break;
        case 'KeyD':
          player.transform.direction.x = pressed ? 1 : 0;
          break;
        case 'KeyW':
          player.transform.direction.y = pressed ? -1 : 0;
          break;
        case 'KeyS':
          player.transform.direction.y = pressed ? 1 : 0;
          break;
        case 'KeyJ':
          if (!pressed) await toggleDance();
          return;
        case 'KeyT':
          if (!pressed) await throwSnowball();
          return;
      }
      let type: 'walk' | 'idle' = 'idle',
        dir: TPenguinAnimationDirection = 'down';
      if (
        player.transform.direction.x === 0 &&
        player.transform.direction.y === 0
      ) {
        type = 'idle';
        dir = player.currentAnimation.split(
          '/'
        )[1] as TPenguinAnimationDirection;
      } else if (
        player.transform.direction.x !== 0 &&
        player.transform.direction.y !== 0
      ) {
        type = 'walk';
        if (player.transform.direction.x > 0)
          dir = player.transform.direction.y > 0 ? 'down-right' : 'top-right';
        else dir = player.transform.direction.y > 0 ? 'down-left' : 'top-left';
      } else if (player.transform.direction.x !== 0) {
        type = 'walk';
        dir = player.transform.direction.x > 0 ? 'right' : 'left';
      } else if (player.transform.direction.y !== 0) {
        type = 'walk';
        dir = player.transform.direction.y > 0 ? 'down' : 'top';
      }

      emit('update-velocity', { key, pressed, anim: `${type}/${dir}` });
      await onMoveChange(type, dir);
    },
    [emit, resetToNextAnimation]
  );
  useKeybindsToggle(
    ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyT'],
    onBindToggle,
    []
  );

  return React.useMemo(
    () => (
      <div
        style={{
          height: '100dvh',
          width: '100dvw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
