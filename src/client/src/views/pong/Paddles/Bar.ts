import { Bar } from '@shared/Pong/Paddles/Bar';
import { Vector2D } from '../utils/Vector';
import { UIBubble } from '../SpecialPowers/Bubble';
import { UIIce } from '../SpecialPowers/Ice';
import { UIFire } from '../SpecialPowers/Fire';
import { UISpark } from '../SpecialPowers/Spark';
import { UIGhost } from '../SpecialPowers/Ghost';
import PongModel from '@typings/models/pong';
import type { UIGame } from '../Game';

export abstract class UIBar extends Bar {

  public static create(
    specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    center: Vector2D,
    direction: number,
    shooter: Bar,
    tag: string,
    uigame?: UIGame,
  ) {
    console.log('create' + specialPower + ' ' + tag);
    switch (specialPower) {
      case PongModel.Models.LobbyParticipantSpecialPowerType.bubble:
        return new UIBubble(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter,
          tag
        );
      case PongModel.Models.LobbyParticipantSpecialPowerType.ice:
        return new UIIce(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter,
          tag
        );
      case PongModel.Models.LobbyParticipantSpecialPowerType.fire:
        return new UIFire(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter,
          tag
        );
      case PongModel.Models.LobbyParticipantSpecialPowerType.spark:
        return new UISpark(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter,
          tag
        );
      case PongModel.Models.LobbyParticipantSpecialPowerType.ghost:
        return new UIGhost(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter,
          tag,
          uigame as UIGame
        );
    }
  }
}
