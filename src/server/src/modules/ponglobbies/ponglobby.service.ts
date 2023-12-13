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
import { ChatModel, EndpointData } from '@typings/api';
import User from '../users/user';

@Injectable()
export class PongLobbyService {
  private readonly games: Map<number, PongLobby> = new Map();
  public readonly usersInGames: Map<number, number> = new Map(); // userId, lobbyId
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
    return Array.from(this.games.values()).map((lobby) => lobby.infoDisplay);
  }

  public async changeTeam(
    userId: number,
    teamId: PongModel.Models.TeamSide,
    teamPosition: number,
    lobbyId: number,
  ): Promise<void> {
    if (!this.usersInGames.has(userId))
      throw new ForbiddenException('User is not in a lobby/game');
    if (lobbyId !== this.usersInGames.get(userId))
      throw new ForbiddenException('User is not in the specified lobby');
    const lobby = this.games.get(lobbyId);
    if (!lobby) throw new Error('Could not find lobby');
    if (lobby.changeTeam(userId, teamId, teamPosition))
      lobby.syncParticipants();
    else throw new ForbiddenException('Could not change team');
  }

  public async changeOwner(
    userId: number,
    lobbyId: number,
    ownerToBeId: number,
  ): Promise<void> {
    if (!this.usersInGames.has(userId))
      throw new ForbiddenException('User is not in a lobby/game');
    if (lobbyId !== this.usersInGames.get(userId))
      throw new ForbiddenException('User is not in the specified lobby');
    console.log(ownerToBeId, this.usersInGames);
    if (!this.usersInGames.has(ownerToBeId))
      throw new ForbiddenException('Owner to be is not in a lobby/game');
    if (lobbyId !== this.usersInGames.get(ownerToBeId))
      throw new ForbiddenException('Owner to be is not in the specified lobby');
    const lobby = this.games.get(lobbyId);
    if (!lobby) throw new Error('Could not find lobby');
    if (await lobby.changeOwner(userId, ownerToBeId)) lobby.syncParticipants();
    else throw new ForbiddenException('Could not change owner');
  }

  public async ready(userId: number, lobbyId: number): Promise<void> {
    if (!this.usersInGames.has(userId))
      throw new ForbiddenException('User is not in a lobby/game');
    if (lobbyId !== this.usersInGames.get(userId))
      throw new ForbiddenException('User is not in the specified lobby');
    const lobby = this.games.get(lobbyId);
    if (!lobby) throw new Error('Could not find lobby');
    if (lobby.ready(userId)) lobby.syncParticipants();
    else throw new ForbiddenException('Could not ready');
  }

  public async kick(
    userId: number,
    lobbyId: number,
    userToKickId: number,
  ): Promise<void> {
    if (!this.usersInGames.has(userId))
      throw new ForbiddenException('User is not in a lobby/game');
    if (lobbyId !== this.usersInGames.get(userId))
      throw new ForbiddenException('User is not in the specified lobby');
    const lobby = this.games.get(lobbyId);
    if (!lobby) throw new Error('Could not find lobby');
    if (await lobby.kick(userId, userToKickId)) {
      this.usersInGames.delete(userToKickId);
      lobby.sendToParticipant(userToKickId, PongModel.Sse.Events.Kick, null);
      lobby.syncParticipants();
    } else throw new ForbiddenException('Could not kick');
  }

  public async joinLobby(
    user: User,
    lobbyId: number,
    password: string | null,
  ): Promise<PongLobby> {
    if (this.usersInGames.has(user.id))
      throw new ForbiddenException('User is already in a lobby/game');
    const lobby = this.games.get(lobbyId);
    if (!lobby) throw new ForbiddenException('Lobby does not exist');
    if (lobby.status !== PongModel.Models.LobbyStatus.Waiting)
      throw new ForbiddenException('Lobby is not available for joining');
    lobby.verifyAuthorization(password);
    const newUser = new PongLobbyParticipant(user, lobby);
    this.usersInGames.set(newUser.id, lobby.id);
    await lobby.chat.addParticipant(newUser.user);
    await lobby.chat.addMessage(
      newUser.user,
      {
        message: 'joined the lobby',
        meta: {},
        type: ChatModel.Models.ChatMessageType.Normal,
      },
      false,
    );
    lobby.syncParticipants();
    return lobby;
  }

  // only used inside the lobby screen
  public async joinSpectators(user: User, lobbyId: number): Promise<void> {
    if (!this.usersInGames.has(user.id))
      throw new ForbiddenException('User is not in a lobby/game');
    if (this.usersInGames.get(user.id) !== lobbyId)
      throw new ForbiddenException('User is not in the specified lobby');
    const lobby = this.games.get(lobbyId);
    if (!lobby) throw new ForbiddenException('Lobby does not exist');
    if (lobby.joinSpectators(user.id)) lobby.syncParticipants();
    else throw new ForbiddenException('Could not join spectators');
  }

  public async leaveLobby(user: User): Promise<PongLobby> {
    console.log(this.usersInGames, user.id);
    if (!this.usersInGames.has(user.id))
      throw new Error('User is not in a lobby/game');
    const lobby = this.games.get(this.usersInGames.get(user.id)!);
    if (!lobby) throw new Error('User is in a non-existent lobby/game');
    await lobby.removePlayer(user.id);
    lobby.syncParticipants();
    this.usersInGames.delete(user.id);
    if (lobby.nPlayers === 0 && lobby.spectators.length === 0) {
      await lobby.delete();
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
    const lobby = await new PongLobby(this.deps, body, this.lobbyId, user);
    this.games.set(this.lobbyId, lobby);
    console.log(
      `Lobby-${lobby.id}: ${lobby.name} created by ${
        (await lobby.owner).nickname
      }`,
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
