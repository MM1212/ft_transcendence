import { Player } from '@shared/Lobby/Player';
import LobbyModel from '@typings/models/lobby';
import { ServerLobby } from './Lobby';
import { Character } from '@shared/Lobby/Character';
import { Socket } from 'socket.io';

export class ServerPlayer extends Player {
  public readonly cons: Socket[] = [];
  constructor(
    id: number,
    name: string,
    character: LobbyModel.Models.ICharacter,
    transform: LobbyModel.Models.ITransform,
    lobby: ServerLobby,
    CharacterConstructor: typeof Character = Character,
    sock?: Socket,
  ) {
    super(id, name, character, transform, lobby, CharacterConstructor);
    if (sock) this.cons.push(sock);
  }

  public get lobby(): ServerLobby {
    return this._lobby as ServerLobby;
  }

  async destructor(): Promise<void> {
    await super.destructor();
  }
  async onMount(): Promise<void> {
    await super.onMount();
    const lobby = this.lobby.public;
    lobby.players = lobby.players.map((p) => {
      if (p.id === this.id) p.main = true;
      return p;
    });
    await this.broadcastTo('lobby:init', this.cons, lobby);
  }
  private lastPositionSync: number = performance.now();
  async onUpdate(delta: number): Promise<boolean> {
    if (!await super.onUpdate(delta)) {
      return false;
    }
    if (performance.now() - this.lastPositionSync > 1000) {
      this.lastPositionSync = performance.now();
      this.broadcastSync('player:move', {
        id: this.id,
        transform: this.transform.toObject(),
      });
    }
    return true;
  }
  async broadcastTo(
    event: string,
    target: Socket,
    ...args: any[]
  ): Promise<void>;
  async broadcastTo(
    event: string,
    target: Socket[],
    ...args: any[]
  ): Promise<void>;
  async broadcastTo(
    event: string,
    targets: Socket[] | Socket,
    ...args: any[]
  ): Promise<void> {
    if (!Array.isArray(targets)) targets = [targets];
    await Promise.all(targets.map((sock) => sock.emitWithAck(event, ...args)));
  }
  async broadcast(event: string, ...args: any[]): Promise<void> {
    await Promise.all(
      this.cons.map((sock) => sock.emitWithAck(event, ...args)),
    );
  }
  broadcastSync(event: string, ...args: any[]): void {
    this.cons.forEach((sock) => sock.emit(event, ...args));
  }
  public async addConnection(sock: Socket): Promise<void> {
    this.cons.push(sock);
    const lobby = this.lobby.public;
    lobby.players = lobby.players.map((p) => {
      if (p.id === this.id) p.main = true;
      return p;
    });
    console.log('addConnection', sock.id);
    await this.broadcastTo('lobby:init', sock, lobby);
    console.log('addConnection', sock.id, 'done');
  }
  public async removeConnection(sock: Socket): Promise<void> {
    const index = this.cons.indexOf(sock);
    if (index !== -1) this.cons.splice(index, 1);
  }
}
