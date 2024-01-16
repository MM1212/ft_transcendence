import { LobbyModel } from './types';
import { Character } from './Character';
import { Transform } from './Transform';
import { Lobby } from './Lobby';
import { IClassFeedbackLifeCycle, IClassLifeCycle } from './utils';
import { IS_CLIENT } from './constants';
import Vector2D from '../Vector/Vector2D';

export class Player
  implements LobbyModel.Models.IPlayer, IClassFeedbackLifeCycle
{
  public character: Character;
  public readonly transform: Transform;
  constructor(
    public readonly id: number,
    public readonly name: string,
    character: LobbyModel.Models.ICharacter,
    transform: LobbyModel.Models.ITransform,
    protected readonly _lobby: Lobby,
    CharacterConstructor: typeof Character = Character
  ) {
    this.character = new CharacterConstructor(
      character.clothes,
      character.animation,
      this
    );
    this.transform = new Transform(
      transform.position,
      transform.direction,
      transform.speed
    );
  }

  public get public(): LobbyModel.Models.IPlayer {
    return {
      id: this.id,
      name: this.name,
      character: this.character.public,
      transform: this.transform.toObject(),
    };
  }

  public get lobby(): Lobby {
    return this._lobby;
  }

  public get isMain(): boolean {
    return this._lobby.mainPlayer?.id === this.id;
  }

  public get isMoving(): boolean {
    return this.transform.speed !== 0;
  }

  public get isIdle(): boolean {
    return this.character.animation.startsWith('idle');
  }

  public get direction(): LobbyModel.Models.TPenguinAnimationDirection {
    return (
      (this.character.animation.split(
        '/'
      )[1] as LobbyModel.Models.TPenguinAnimationDirection) ?? 'down'
    );
  }

  async destructor(): Promise<void> {
    await this.character.destructor();
    await this.transform.destructor();
  }
  async onMount(): Promise<void> {
    await this.character.onMount();
    await this.transform.onMount();
  }

  private isNewPositionOutOfBounds(): boolean {
    return !this.lobby.collision.isPositionValid(this.transform.position);
  }
  async onUpdate(delta: number): Promise<boolean> {
    await this.character.onUpdate(delta);
    const lastPosition = this.transform.position;
    if (!(await this.transform.onUpdate(delta))) return false;
    if (this.isNewPositionOutOfBounds()) {
      this.transform.position = lastPosition;
      return false;
    }
    return true;
  }

  async handleAction(_key: string): Promise<boolean> {
    return false;
  }

  handleMovement(key: string, pressed: boolean): boolean {
    switch (key) {
      case 'w': {
        this.transform.direction = new Vector2D(this.transform.direction.x, pressed ? -1 : 0);
        break;
      }
      case 's': {
        this.transform.direction = new Vector2D(this.transform.direction.x, pressed ? 1 : 0);
        break;
      }
      case 'a': {
        this.transform.direction = new Vector2D(pressed ? -1 : 0, this.transform.direction.y);
        break;
      }
      case 'd': {
        this.transform.direction = new Vector2D(pressed ? 1 : 0, this.transform.direction.y);
        break;
      }
      default:
        return false;
    }
    if (this.transform.direction.length() !== 0) this.transform.speed = 3.5;
    else this.transform.speed = 0;
    if (IS_CLIENT && this.isMain) this.lobby.events.emit('self:movement', this);
    return true;
  }
  async handleNewAnimation(): Promise<void> {
    let type: 'walk' | 'idle' = 'idle',
      dir: LobbyModel.Models.TPenguinAnimationDirection = 'down';
    if (this.transform.direction.length() === 0) {
      type = 'idle';
      dir = this.character.animation.split(
        '/'
      )[1] as LobbyModel.Models.TPenguinAnimationDirection;
    } else if (
      this.transform.direction.x !== 0 &&
      this.transform.direction.y !== 0
    ) {
      type = 'walk';
      if (this.transform.direction.x > 0)
        dir = this.transform.direction.y > 0 ? 'down-right' : 'top-right';
      else dir = this.transform.direction.y > 0 ? 'down-left' : 'top-left';
    } else if (this.transform.direction.x !== 0) {
      type = 'walk';
      dir = this.transform.direction.x > 0 ? 'right' : 'left';
    } else if (this.transform.direction.y !== 0) {
      type = 'walk';
      dir = this.transform.direction.y > 0 ? 'down' : 'top';
    }
    await this.character.playAnimation(`${type}/${dir}`);
  }
  async onKeyPress(key: string): Promise<void> {
    if (!this.handleMovement(key, true)) return;
    await this.handleNewAnimation();
  }
  async onKeyRelease(key: string): Promise<void> {
    if (await this.handleAction(key)) return;
    if (!this.handleMovement(key, false)) return;
    await this.handleNewAnimation();
  }
  async resetKeys(): Promise<void> {
    this.transform.direction = Vector2D.Zero;
    this.transform.speed = 0;
    if (IS_CLIENT && this.isMain) this.lobby.events.emit('self:movement', this);
    await this.handleNewAnimation();
  }
}
