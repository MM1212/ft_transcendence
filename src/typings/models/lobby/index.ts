import { vector2 } from '@typings/vector';

export namespace LobbyModel {
  export namespace Models {
    export type InventoryCategory =
      | 'head'
      | 'face'
      | 'neck'
      | 'body'
      | 'hand'
      | 'feet'
      | 'color';

    export type TPenguinAnimationDirection =
      | 'down'
      | 'down-left'
      | 'left'
      | 'top-left'
      | 'top'
      | 'top-right'
      | 'right'
      | 'down-right';

    export type TPenguinAnimationSets = 'idle' | 'walk' | 'seat' | 'snowball';

    export type IPenguinAnimationSetTypes<
      K extends TPenguinAnimationSets = TPenguinAnimationSets,
      T extends TPenguinAnimationDirection = TPenguinAnimationDirection
    > = `${K}/${T}`;

    export type IPenguinBaseAnimationsTypes =
      | IPenguinAnimationSetTypes<'idle'>
      | IPenguinAnimationSetTypes<'walk'>
      | IPenguinAnimationSetTypes<'seat'>
      | 'wave'
      | 'dance'
      | IPenguinAnimationSetTypes<
          'snowball',
          Exclude<TPenguinAnimationDirection, 'down' | 'left' | 'top' | 'right'>
        >;

    export interface AnimationConfigSet {
      id: number;
      frames?: number;
      speed?: number;
      loop?: boolean;
      next?: IPenguinBaseAnimationsTypes;
    }

    export type TPenguinColorPriority = Record<InventoryCategory, number>;
    export type TPenguinColorPalette = Record<number, string>;

    export interface ITransform {
      position: vector2;
      direction: vector2;
      speed: number;
    }
    export interface ICharacter {
      animation: IPenguinBaseAnimationsTypes;
      clothes: Record<InventoryCategory, number>;
    }
    export interface IPlayer {
      id: number;
      name: string;
      character: ICharacter;
      transform: ITransform;
    }

    export interface ILobby {
      players: (IPlayer & { main: boolean })[];
      chatId: number;
    }
  }
  export namespace DTO {}
  export namespace Endpoints {}
  export namespace Sse {}
  export namespace Socket {}
}

export default LobbyModel;
