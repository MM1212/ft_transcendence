import { Player } from './Player';
import { LobbyModel } from './types';
import { IClassLifeCycle } from './utils';

const IS_CLIENT = typeof window !== 'undefined';

export class Character
  implements LobbyModel.Models.ICharacter, IClassLifeCycle
{
  constructor(
    public clothes: Record<LobbyModel.Models.InventoryCategory, number>,
    public animation: LobbyModel.Models.IPenguinBaseAnimationsTypes,
    public readonly player: Player
  ) {}

  public get tint(): number {
    return this.clothes.color;
  }

  public get public(): LobbyModel.Models.ICharacter {
    return {
      clothes: this.clothes,
      animation: this.animation,
    };
  }

  async destructor(): Promise<void> {}
  async onMount(): Promise<void> {}
  async onUpdate(_delta: number): Promise<void> {}

  public async playAnimation(
    animation: LobbyModel.Models.IPenguinBaseAnimationsTypes,
    force: boolean = false
  ): Promise<boolean> {
    if (this.animation === animation && !force) return false;
    this.animation = animation;
    this.player.lobby.events.emit('player:animation', this, animation);
    if (IS_CLIENT)
      this.player.lobby.events.emit('self:animation', this, animation);
    return true;
  }
  public async setTint(tint: number): Promise<void> {
    this.clothes.color = tint;
  }
  public async setClothes(clothes: Record<string, number>): Promise<void> {
    this.clothes = clothes;
  }
}
