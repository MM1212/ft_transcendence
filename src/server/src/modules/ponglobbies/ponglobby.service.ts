import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PongLobby, PongLobbyParticipant } from './ponglobby';
import { PongLobbyDependencies } from './ponglobby/dependencies';
import { DbService } from '../db';
import { UsersService } from '../users/users.service';
import PongModel from '@typings/models/pong';
import { EndpointData } from '@typings/api';
import User from '../users/user';

@Injectable()
export class PongLobbyService {
  private readonly games: Map<number, PongLobby> = new Map();
  private readonly usersInGames: Map<number, number> = new Map(); // userId, lobbyId
  private lobbyId = 0;

  constructor(private readonly deps: PongLobbyDependencies) {
    // @ts-expect-error - circular dependency
    this.deps.service = this;
  }

  public async getLobby(user: User): Promise<PongLobby> {
    if (!this.usersInGames.has(user.id))
      throw new ForbiddenException('User is not in a lobby/game');
    const lobbyId = this.usersInGames.get(user.id)!;
    const lobby = this.games.get(lobbyId);
    if (!lobby)
      throw new InternalServerErrorException(
        'User is in a non-existent lobby/game',
      );
    return lobby;
  }

  public async getAllLobbies(): Promise<PongModel.Models.ILobbyInfoDisplay[]> {
    return Array.from(this.games.values()).map(lobby => lobby.infoDisplay);
  }

  public async joinLobby(user: User, lobbyId: number, password: string | null): Promise<PongLobby> {
    if (this.usersInGames.has(user.id))
      throw new ForbiddenException('User is already in a lobby/game');
    const lobby = this.games.get(lobbyId);
    if (!lobby) throw new ForbiddenException('Lobby does not exist');
    // check authorization
    // check game status
    const newUser = new PongLobbyParticipant(user, lobby);
    this.usersInGames.set(newUser.id, lobby.id);
    lobby.syncParticipants();
    return lobby;
  }

  public async leaveLobby(user: User): Promise<PongModel.Models.ILobby>{
    console.log(this.usersInGames, user.id)
    if (!this.usersInGames.has(user.id))
      throw new Error('User is not in a lobby/game');
    const lobby = this.games.get(this.usersInGames.get(user.id)!);
    if (!lobby) throw new Error('User is in a non-existent lobby/game');
    lobby.removePlayer(user.id);
    this.usersInGames.delete(user.id);
    if (lobby.nPlayers === 0 && lobby.spectators.length === 0) {
      this.games.delete(lobby.id);
      console.log(`Lobby-${lobby.id}: ${lobby.name} deleted`);
    }
    return lobby;
  }

  public async createLobby(
    user: User,
    body: EndpointData<PongModel.Endpoints.NewLobby>,
  ): Promise<PongLobby> {
    if (!body) throw new Error('Body is empty');
    if (this.usersInGames.has(user.id))
      throw new Error('User is already in a lobby/game');
    const lobby = new PongLobby(this.deps, body, this.lobbyId);
    this.games.set(this.lobbyId, lobby);
    const newUser = new PongLobbyParticipant(user, lobby);
    lobby.setPrivileges(newUser, PongModel.Models.LobbyParticipantPrivileges.Owner);
    this.usersInGames.set(newUser.id, this.lobbyId);
    console.log(
      `Lobby-${lobby.id}: ${lobby.name} created by ${newUser.nickname}`,
    );
    this.lobbyId++;
    return lobby;
  }

  private get db(): DbService {
    return this.deps.db;
  }
  private get users(): UsersService {
    return this.deps.usersService;
  }
}
