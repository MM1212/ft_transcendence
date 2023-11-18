import { IInventory, inventoryAtom } from '@apps/Customization/state';
import penguinState, {
  AnimationConfigSet,
  IPenguinBaseAnimations,
  animationConfig,
} from '@apps/penguin/state';
import { Pixi } from '@hooks/pixiRenderer';
import { socketStorageAtom } from '@hooks/socket/state';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { sessionAtom } from '@hooks/user/state';
import { Lobbies } from '@typings/lobby';
import LobbyModel from '@typings/models/lobby';
import { IPenguinBaseAnimationsTypes } from '@typings/penguin';
import {
  DefaultValue,
  RecoilValue,
  atom,
  selector,
  useRecoilValue,
} from 'recoil';

export interface PlayerLayers {
  container: Pixi.Container;
  belly: Pixi.AnimatedSprite;
  fixtures: Pixi.AnimatedSprite;
  clothing: Record<string, Pixi.AnimatedSprite>;
  base?: Pixi.Sprite;
  baseShadow: Pixi.Sprite;
}

export interface Player extends Lobbies.IPlayer {
  layers: PlayerLayers | null;
  nickNameText: Pixi.Text | null;
  allowMove: boolean;
}

export interface InitdPlayer extends Omit<Player, 'layers'> {
  layers: PlayerLayers;
  currentAnimation: keyof IPenguinBaseAnimations;
  nickNameText: Pixi.Text;
}

export const lobbyPlayersAtom = atom<Player[]>({
  key: 'lobby/players',
  default: [],
  dangerouslyAllowMutability: true,
});

export const setupAnimation = async (
  sprite: Pixi.AnimatedSprite,
  baseAnim: IPenguinBaseAnimationsTypes
) => {
  const { speed = 0.3, loop = true }: AnimationConfigSet = animationConfig[
    baseAnim
  ] as AnimationConfigSet;
  sprite.animationSpeed = speed;
  sprite.loop = loop;
  sprite.gotoAndPlay(0);
};
export const switchToAnimation = async (
  player: Player,
  animation: keyof IPenguinBaseAnimations,
  inventory: IInventory,
  {
    getPromise,
  }: { getPromise: <S>(recoilValue: RecoilValue<S>) => Promise<S> },
  force = false
) => {
  if (!player.layers) return;
  if (player.currentAnimation === animation && !force) return;
  player.currentAnimation = animation;

  const getSequence = async (asset: string) =>
    (await getPromise(penguinState.baseAnimations(asset)))[animation];

  player.layers.belly.textures = await getSequence('body');
  player.layers.fixtures.textures = await getSequence('penguin');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { color, ...selected } = inventory.selected;
  await Promise.all(
    Object.keys(player.layers.clothing).map(async (clothPiece) => {
      if (!player.layers) return;
      player.layers.clothing[clothPiece].textures = await getSequence(
        selected[clothPiece as keyof typeof selected].toString()
      );
    })
  );
  setupAnimation(player.layers.belly, animation);
  setupAnimation(player.layers.fixtures, animation);
  Object.values(player.layers.clothing).forEach((clothPiece) =>
    setupAnimation(clothPiece, animation)
  );
};

export const lobbyAppAtom = atom<Pixi.Application | null>({
  key: 'lobby/renderer',
  default: null,
  dangerouslyAllowMutability: true,
  effects: [
    ({ getPromise, onSet }) => {
      onSet(async (app) => {
        if (!app || app instanceof DefaultValue) return;
        const tick = async (delta: number) => {
          const players = await getPromise(lobbyPlayersAtom);

          for (const player of players) {
            if (!player.layers?.container) continue;
            player.transform.position.x += player.transform.velocity.x * delta;
            player.transform.position.y += player.transform.velocity.y * delta;

            player.layers.container.x = player.transform.position.x;
            player.layers.container.y = player.transform.position.y;
          }
        };

        const onMouseMove = async (event: Pixi.FederatedMouseEvent) => {
          const sock = await getPromise(
            socketStorageAtom(
              buildTunnelEndpoint(LobbyModel.Endpoints.Targets.Connect)
            )
          );
          const selfPlayer = await getPromise(lobbyCurrentPlayerSelector);
          if (
            !selfPlayer ||
            !selfPlayer.layers ||
            selfPlayer.currentAnimation.split('/')[0] !== 'idle'
          )
            return;
          const inventory = await getPromise(inventoryAtom);
          const {
            transform: { position },
          } = selfPlayer;
          const {x, y} = app.stage.toLocal(event.client);
          const angle = Math.atan2(y - position.y, x - position.x) + Math.PI;

          const slice = (Math.PI * 2) / 8;
          const animations: {
            from: number;
            to: number;
            anim: IPenguinBaseAnimationsTypes;
          }[] = (
            [
              'idle/left',
              'idle/top-left',
              'idle/top',
              'idle/top-right',
              'idle/right',
              'idle/down-right',
              'idle/down',
              'idle/down-left',
            ] as const
          ).map((anim, i) => {
            return {
              from: slice * i - slice / 2,
              to: slice * i + slice / 2,
              anim,
            };
          });
          const animation = animations.find(
            (anim) => angle >= anim.from && angle <= anim.to
          );

          if (!animation) return;
          if (selfPlayer.currentAnimation === animation.anim) return;
          sock.emit('lobby:update-animation', { anim: animation.anim });
          switchToAnimation(selfPlayer, animation.anim, inventory, {
            getPromise,
          });
        };
        app.ticker.add(tick);
        app.stage.interactive = true;
        app.stage.onmousemove = onMouseMove;
        const onResize = () => {
          console.log('resize');
          if (!app.stage) return;
          if (
            window.innerWidth / window.innerHeight >=
            LobbyModel.Models.STAGE_ASPECT_RATIO
          ) {
            app.renderer.resize(
              window.innerHeight * LobbyModel.Models.STAGE_ASPECT_RATIO,
              window.innerHeight
            );
          } else {
            app.renderer.resize(
              window.innerWidth,
              window.innerWidth / LobbyModel.Models.STAGE_ASPECT_RATIO
            );
          }
          app.stage.scale.x =
            app.renderer.width / LobbyModel.Models.STAGE_WIDTH;
          app.stage.scale.y =
            app.renderer.height / LobbyModel.Models.STAGE_HEIGHT;
        };
        onResize();
        window.addEventListener('resize', onResize);
        return () => {
          app.ticker.remove(tick);
          app.stage.onmousemove = null;
          window.removeEventListener('resize', onResize);
        };
      });
    },
  ],
});

export const lobbyCurrentPlayerSelector = selector<Player | null>({
  key: 'lobby/currentPlayer',
  get: ({ get }) => {
    const session = get(sessionAtom);
    const players = get(lobbyPlayersAtom);
    if (!session) return null;
    return players.find((player) => player.userId === session.id) ?? null;
  },
  dangerouslyAllowMutability: true,
});

// Lets create a context that will keep the state of an element

export const allowPlayerMove = atom<boolean>({
  key: 'lobby/allowPlayerMove',
  default: false,
});

export const allowPlayerFocus = atom<boolean>({
  key: 'lobby/allowPlayerFocus',
  default: false,
});

export const useLobbyPlayers = (): Player[] => useRecoilValue(lobbyPlayersAtom);

export const useCurrentLobbyPlayer = (): Player | null =>
  useRecoilValue(lobbyCurrentPlayerSelector);

// Lets create an arrow function that returns a reference to an Input element

//export const getInputRef = (): React.RefObject<HTMLInputElement> => {
// const inputRef = React.useRef<HTMLInputElement>(null);
// return inputRef;
//}
