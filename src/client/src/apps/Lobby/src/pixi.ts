import { Pixi } from '@hooks/pixiRenderer';
import LobbyModel from '@typings/models/lobby';

export type IPenguinAnimationSet<
  K extends
    LobbyModel.Models.TPenguinAnimationSets = LobbyModel.Models.TPenguinAnimationSets,
  T extends
    LobbyModel.Models.TPenguinAnimationDirection = LobbyModel.Models.TPenguinAnimationDirection,
> = Record<LobbyModel.Models.IPenguinAnimationSetTypes<K, T>, Pixi.Texture[]>;

export type IPenguinBaseAnimations = {
  [K in LobbyModel.Models.IPenguinBaseAnimationsTypes]: Pixi.Texture[];
};
