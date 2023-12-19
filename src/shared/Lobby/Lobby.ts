import { type IClassLifeCycle } from './utils';
import { Player } from './Player';
import { Collision } from './Collision';
import { LobbyModel } from './types';
import { Events } from './Events';
import { Transform } from './Transform';
import { LOBBY_STAGE_SIZE } from './constants';
import Vector2D from '../Vector/Vector2D';

export class Lobby implements IClassLifeCycle {
  public readonly players: Player[];
  constructor(
    players: LobbyModel.Models.IPlayer[],
    protected mainPlayerId: number,
    public readonly collision: Collision,
    public readonly events: Events,
    protected readonly PlayerConstructor: typeof Player = Player,
    protected readonly defaultTransform: Transform = new Transform(
      LOBBY_STAGE_SIZE.divide(2),
      Vector2D.Zero,
      0
    )
  ) {
    this.players = players.map(
      (p) => new PlayerConstructor(p.id, p.name, p.character, p.transform, this)
    );
  }

  public get public(): LobbyModel.Models.ILobby {
    return {
      players: this.players.map((p) => ({
        ...p.public,
        main: false,
      })),
    };
  }

  public get mainPlayer(): Player | undefined {
    return this.getPlayer(this.mainPlayerId);
  }

  public set mainPlayer(id: number) {
    this.mainPlayerId = id;
  }

  public async destructor(): Promise<void> {
    for (const player of this.players) {
      await player.destructor();
    }
  }
  async onMount(): Promise<void> {
    console.log('loading collision');
    
    await this.collision.onMount();
    console.log('collision loaded');
    
    for (const player of this.players) {
      await player.onMount();
    }
  }
  async onUpdate(delta: number): Promise<void> {
    for (const player of this.players) {
      await player.onUpdate(delta);
    }
  }

  public async addPlayer(
    playerData: Pick<LobbyModel.Models.IPlayer, 'id' | 'name'>,
    characterData: LobbyModel.Models.ICharacter,
    transform: LobbyModel.Models.ITransform = this.defaultTransform,
    ...args: any[]
  ): Promise<Player> {
    const player = new this.PlayerConstructor(
      playerData.id,
      playerData.name,
      characterData,
      transform,
      this,
      ...args
    );
    this.players.push(player);
    await player.onMount();
    return player;
  }

  public getPlayer(playerId: number): Player | undefined;
  public getPlayer(playerName: string): Player | undefined;
  public getPlayer(player: number | string): Player | undefined {
    if (typeof player === 'number') {
      return this.players.find((p) => p.id === player);
    } else {
      return this.players.find((p) => p.name === player);
    }
  }

  public async removePlayer(playerId: number): Promise<boolean>;
  public async removePlayer(playerName: string): Promise<boolean>;
  public async removePlayer(player: Player): Promise<boolean>;

  public async removePlayer(
    playerHandle: number | string | Player
  ): Promise<boolean> {
    const player =
      playerHandle instanceof Player
        ? playerHandle
        : this.getPlayer(playerHandle as any);
    if (!player) throw new Error(`Player ${playerHandle} not found in lobby`);
    const index = this.players.indexOf(player);
    if (index === -1) return false;
    await player.destructor();
    this.players.splice(index, 1);
    return true;
  }
}
