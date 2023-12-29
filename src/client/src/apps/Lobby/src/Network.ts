import LobbyModel from '@typings/models/lobby';
import { ClientLobby } from './Lobby';
import { ClientPlayer } from './Player';
import { IEventPackage } from '@shared/Lobby/Events';
import { Socket } from 'socket.io-client';
import { Transform } from '@shared/Lobby/Transform';
import Vector2D from '@shared/Vector/Vector2D';

export interface IPlayerAnimationEvent
  extends IEventPackage<
    'self:animation',
    [ClientPlayer, LobbyModel.Models.IPenguinBaseAnimationsTypes]
  > {}

export interface IPlayerDirectionEvent
  extends IEventPackage<'self:movement', [ClientPlayer, Transform]> {}

export interface IPlayerClothesEvent
  extends IEventPackage<
    'self:clothes:update',
    [Record<LobbyModel.Models.InventoryCategory, number>]
  > {}

export interface INetPlayerClothesEvent
  extends IEventPackage<
    'self:net:clothes:update',
    [Record<LobbyModel.Models.InventoryCategory, number>]
  > {}

export class Network {
  constructor(private readonly lobby: ClientLobby) {
    this.lobby.events.on<IPlayerAnimationEvent>(
      'self:animation',
      this.onNewAnimation.bind(this)
    );
    this.lobby.events.on<IPlayerDirectionEvent>(
      'self:movement',
      this.onNewDirection.bind(this)
    );
    this.lobby.events.on<IPlayerClothesEvent>(
      'self:clothes:update',
      this.onClothingChange.bind(this)
    );
  }

  private get sock(): Socket {
    return this.lobby.socket;
  }

  private onNewAnimation(
    _player: ClientPlayer,
    animation: LobbyModel.Models.IPenguinBaseAnimationsTypes
  ) {
    // console.log('broadcasting player animation', animation);
    this.sock.emit('lobby:net:player:animation', { animation });
  }
  private onNewDirection(player: ClientPlayer) {
    // console.log(
    // 'broadcasting player movement',
    // player.transform.direction.toObject()
    // );
    this.sock.emit('lobby:net:player:direction', {
      transform: {
        direction: player.transform.direction.toObject(),
      },
    });
  }

  public async netOnPlayerAnimation(
    playerId: number,
    animation: LobbyModel.Models.IPenguinBaseAnimationsTypes
  ): Promise<void> {
    // console.log('BOAS', playerId, animation);

    const player = this.lobby.getPlayer(playerId) as ClientPlayer;
    if (!player) return;
    await player.character.playAnimation(animation, false, false);
  }

  public async netOnPlayerMove(
    playerId: number,
    transform: Partial<LobbyModel.Models.ITransform>
  ): Promise<void> {
    const player = this.lobby.getPlayer(playerId) as ClientPlayer;
    if (!player) return;
    // console.log('netOnPlayerMove', playerId, transform);

    if (transform.position) {
      player.transform.position = new Vector2D(transform.position);
    }
    if (transform.direction) {
      player.transform.direction = new Vector2D(transform.direction);
    }
    if (transform.speed !== undefined) {
      player.transform.speed = transform.speed;
    }
  }

  private onClothingChange(
    changed: Record<LobbyModel.Models.InventoryCategory, number>
  ) {
    // console.log('broadcasting player clothing change', changed);
    this.sock.emit('lobby:net:player:clothes', changed);
  }

  public async netOnPlayerClothes(
    playerId: number,
    changed: Record<LobbyModel.Models.InventoryCategory, number>
  ): Promise<void> {
    const player = this.lobby.getPlayer(playerId) as ClientPlayer;
    if (!player) return;
    // console.log('netOnPlayerClothes', playerId, changed);

    for (const [category, id] of Object.entries(changed)) {
      await player.character.dress(
        category as LobbyModel.Models.InventoryCategory,
        id,
        false
      );
    }
    this.lobby.events.emit('self:net:clothes:update', changed);
  }
}
