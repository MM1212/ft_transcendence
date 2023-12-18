import { ClientLobby } from './Lobby';
import { Player } from '@shared/Lobby/Player';
import * as PIXI from 'pixi.js';
import { LOBBY_PLAYER_CONTAINER_SCALE } from '@shared/Lobby/constants';
import { ClientCharacter } from './Character';
import LobbyModel from '@typings/models/lobby';

export class ClientPlayer extends Player {
  public readonly container = new PIXI.Container();
  constructor(
    id: number,
    name: string,
    character: LobbyModel.Models.ICharacter,
    transform: LobbyModel.Models.ITransform,
    lobby: ClientLobby
  ) {
    super(id, name, character, transform, lobby, ClientCharacter);
  }

  public get lobby(): ClientLobby {
    return this._lobby as ClientLobby;
  }

  private updateContainer(): void {
    this.container.position.set(
      this.transform.position.x,
      this.transform.position.y
    );
  }

  private initContainer(): void {
    this.container.name = this.isMain ? 'self' : `player-${this.id}`;
    this.container.scale.set(LOBBY_PLAYER_CONTAINER_SCALE);
    this.container.sortableChildren = true;
    this.updateContainer();
  }

  async destructor(): Promise<void> {
    await super.destructor();
    this.lobby.stage.removeChild(this.container);
    this.container.destroy({
      children: true,
    });
  }

  async onMount(): Promise<void> {
    await super.onMount();
    this.initContainer();
    console.log(`Mounting player ${this.id} (${this.name})`);

    this.lobby.stage.addChild(this.container);
  }

  async onUpdate(delta: number): Promise<boolean> {
    if (!await super.onUpdate(delta))
      return false;
    this.updateContainer();
    return true;
  }

  static readonly slice = (Math.PI * 2) / 8;
  static readonly animations: {
    from: number;
    to: number;
    anim: LobbyModel.Models.IPenguinBaseAnimationsTypes;
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
  )
    .map((anim, i) => {
      return {
        from: this.slice * i - this.slice / 2,
        to: this.slice * i + this.slice / 2,
        anim,
      };
    })
    .map((anim) => {
      if (anim.from > Math.PI * 2) anim.from -= Math.PI * 2;
      else if (anim.from < 0) anim.from += Math.PI * 2;
      if (anim.to > Math.PI * 2) anim.to -= Math.PI * 2;
      else if (anim.to < 0) anim.to += Math.PI * 2;
      return anim;
    });
  async handleMouseMove(ev: PIXI.FederatedMouseEvent): Promise<void> {
    if (!this.isIdle || this.transform.speed !== 0) return;
    const { position } = this.transform;
    const { x, y } = this.lobby.stage.toLocal(ev.client);
    const angle = Math.atan2(y - position.y, x - position.x) + Math.PI;

    const animation = ClientPlayer.animations.find((anim) => {
      // angles are in radians between 0 and 2pi
      const { from, to } = anim;
      // find if the angle is inside the range
      if (from <= to) {
        return angle >= from && angle <= to;
      }
      // if the range crosses 0, check the two halves separately
      return angle >= from || angle <= to;
    });

    if (!animation) return;
    if (this.character.animation === animation.anim) return;
    await this.character.playAnimation(animation.anim);
  }

  async handleAction(key: string): Promise<boolean> {
    switch (key) {
      case 't':
        await this.throwSnowball();
        return true;
      case 'k':
        await this.dance();
        return true;
      default:
        return false;
    }
  }

  async dance(): Promise<void> {
    const isDancing = this.character.animation === 'dance';
    this.transform.speed = 0;
    await this.character.playAnimation(isDancing ? 'idle/down' : 'dance');
  }
  async throwSnowball(): Promise<void> {
    if (!this.isIdle) return;
    let throwDirection = this.direction;
    this.transform.speed = 0;
    if (!throwDirection.includes('-'))
      switch (throwDirection as 'down' | 'left' | 'top' | 'right') {
        case 'down':
          throwDirection = 'down-right';
          break;
        case 'left':
          throwDirection = 'top-left';
          break;
        case 'top':
          throwDirection = 'top-right';
          break;
        case 'right':
          throwDirection = 'down-right';
          break;
      }
    await this.character.playAnimation(
      `snowball/${throwDirection}` as LobbyModel.Models.IPenguinBaseAnimationsTypes
    );
  }
}
