import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PongLobby, PongLobbyParticipant } from './ponglobby';
import { PongLobbyDependencies } from './ponglobby/dependencies';
import { DbService } from '../db';
import { UsersService } from '../users/services/users.service';
import PongModel from '@typings/models/pong';
import { ChatModel, EndpointData } from '@typings/api';
import User from '../users/user';
import { Mutex, ScopeLock } from '@/helpers/mutex';
import botsSpecifications from '@/assets/pong/bots.json';
import UsersModel from '@typings/models/users';

@Injectable()
export class PongLobbyService {
  public readonly games: Map<number, PongLobby> = new Map();
  public readonly usersInGames: Map<number, number> = new Map(); // userId, lobbyId
  private lobbyId = 0;

  private readonly createBotsMutex = new Mutex('pong:create-bots');
  private readonly _bots: Map<string, User> = new Map();

  constructor(private readonly deps: PongLobbyDependencies) {
    // @ts-expect-error - circular dependency
    this.deps.service = this;

    this.createBots();
  }

  private async createBots(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _lock = new ScopeLock(this.createBotsMutex);

    for await (const botSpec of botsSpecifications) {
      let user: User | null = await this.deps.usersService.getByNickname(
        botSpec.nickname,
      );
      if (user) {
        this._bots.set(botSpec.nickname, user);
        continue;
      }
      user = await this.deps.usersService.create({
        avatar: botSpec.avatar,
        nickname: botSpec.nickname,
        inventory: botSpec.inventory,
        type: UsersModel.Models.Types.Bot
      });
      this._bots.set(botSpec.nickname, user);
    }
  }

  public async updateLobbySettings(userid: number, lobbyId: number, score: number, type: boolean, ballSkin: string): Promise<void> {
    if (!this.usersInGames.has(userid))
      throw new ForbiddenException('User is not in a lobby/game');
    if (lobbyId !== this.usersInGames.get(userid))
      throw new ForbiddenException('User is not in the specified lobby');
    const lobby = this.games.get(lobbyId);
    if (!lobby) throw new Error('Could not find lobby');
    if (lobby.ownerId !== userid)
      throw new ForbiddenException('User is not the owner of the lobby');
    if (await lobby.updateSettings(score, type, ballSkin)) {
      lobby.syncSettings();
    }
  }

  public getBot(nickname: string): User | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _lock = new ScopeLock(this.createBotsMutex);
    return this._bots.get(nickname) ?? null;
  }
  public getBots(): User[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _lock = new ScopeLock(this.createBotsMutex);
    return Array.from(this._bots.values());
  }

  public async getLobby(id: number): Promise<PongLobby> {
    const lobby = this.games.get(id);
    if (!lobby) throw new NotFoundException('Lobby does not exist');
    return lobby;
  }
  public getLobbyByUser(user: User): PongLobby {
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

  public async addBot(userId: number, lobbyId:number, teamId: number, teamPosition: number): Promise<void> {
    if (!this.usersInGames.has(userId))
      throw new ForbiddenException('User is not in a lobby/game');
    if (lobbyId !== this.usersInGames.get(userId))
      throw new ForbiddenException('User is not in the specified lobby');
    const lobby = this.games.get(lobbyId);
    if (!lobby) throw new Error('Could not find lobby');
    if (lobby.ownerId !== userId)
      throw new ForbiddenException('User is not the owner of the lobby');
    const bot = this.getBots()[Math.floor(Math.random() * this.getBots().length)];
      if (lobby.addBot(bot, teamId, teamPosition)) lobby.syncParticipants();
    else throw new ForbiddenException('Could not add bot');
  }

  public async startGame(userId: number, lobbyId: number): Promise<PongLobby> {
    if (!this.usersInGames.has(userId))
      throw new ForbiddenException('User is not in a lobby/game');
    if (lobbyId !== this.usersInGames.get(userId))
      throw new ForbiddenException('User is not in the specified lobby');
    const lobby = this.games.get(lobbyId);
    if (!lobby) throw new Error('Could not find lobby');
    if (lobby.ownerId !== userId)
      throw new ForbiddenException('User is not the owner of the lobby');
    if (lobby.status !== PongModel.Models.LobbyStatus.Waiting)
      throw new ForbiddenException('Lobby is not available for starting');
    if (lobby.nPlayers < 2)
      throw new ForbiddenException('Lobby does not have enough players');
    if (await lobby.startGame(userId)) {
      lobby.syncParticipants();
      lobby.emitGameStart();
      return lobby;
    } else throw new ForbiddenException('Could not start game');
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

  public async invite(
    user: User,
    data: PongModel.Endpoints.ChatSelectedData[],
    source: PongModel.Models.InviteSource,
    lobbyId?: number,
  ): Promise<PongLobby> {
    let lobby: PongLobby;
    if (!lobbyId && !this.usersInGames.has(user.id))
      lobby = await this.createLobby(user, {
        password: null,
        name: 'Custom Lobby',
        spectators: PongModel.Models.LobbySpectatorVisibility.All,
        lobbyType: PongModel.Models.LobbyType.Custom,
        lobbyAccess: PongModel.Models.LobbyAccess.Public,
        gameType: PongModel.Models.LobbyGameType.Powers,
        score: 7,
      });
    else
      lobby =
        lobbyId !== undefined
          ? this.games.get(lobbyId)!
          : this.getLobbyByUser(user);
    if (
      // remove the line under when implementing password protection
      lobby.authorization !== PongModel.Models.LobbyAccess.Public &&
      lobby.ownerId !== user.id
    )
      throw new ForbiddenException('User is not authorized to invite');
    await lobby.invite(user, data, source);
    lobby.updateInvited();
    return lobby;
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

  public async kickInvited(
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
    if (await lobby.kickInvited(userId, userToKickId)) {
      lobby.updateInvited();
    } else throw new ForbiddenException('Could not kick');
  }

  public async joinLobby(
    user: User,
    lobbyId: number,
    password: string | null,
    nonce?: number,
    syncToUser: boolean = false,
    isJoiningActive: boolean = false,
  ): Promise<PongLobby> {
    let lobby;
    if (isJoiningActive === false) {
      if (this.usersInGames.has(user.id))
        throw new ForbiddenException('User is already in a lobby/game');
      lobby = this.games.get(lobbyId);
      if (!lobby) throw new ForbiddenException('Lobby does not exist');
      if (nonce && lobby.nonce !== nonce)
        throw new ForbiddenException('Nonce is invalid');
      if (lobby.status !== PongModel.Models.LobbyStatus.Waiting)
        throw new ForbiddenException('Lobby is not available for joining');
      lobby.verifyAuthorization(password);
    }
    lobby = this.games.get(lobbyId)!;
    const newUser = new PongLobbyParticipant(user, lobby);
    this.usersInGames.set(newUser.id, lobby.id);
    lobby.invited = lobby.invited.filter((id) => id !== newUser.id);
    lobby.updateInvited();
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
    if (syncToUser === true) {
      lobby.sendToParticipant(
        newUser.id,
        PongModel.Sse.Events.Join,
        lobby.interface,
      );
    }
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

  public async leaveLobby(
    userId: number,
    syncToUser: boolean = false,
  ): Promise<PongLobby> {
    if (!this.usersInGames.has(userId))
      throw new Error('User is not in a lobby/game');
    const lobby = this.games.get(this.usersInGames.get(userId)!);
    if (!lobby) throw new Error('User is in a non-existent lobby/game');
    await lobby.removePlayer(userId);
    lobby.syncParticipants();
    this.usersInGames.delete(userId);
    if (syncToUser === true) {
      lobby.sendToParticipant(userId, PongModel.Sse.Events.Leave, null);
    }

    console.log(`Lobby-${lobby.id}: ${lobby.name} left by ${userId}`);
    if (lobby.onlyBots) {
      await lobby.removeAllBots();
    }
    if (lobby.nPlayers === 0 && lobby.spectators.length === 0) {
      lobby.allPlayers.forEach((player) => this.usersInGames.delete(player.id));
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
    // this.usersInGames.set(user.id, lobby.id); THIS IS IN LOBBY CONSTRUCTOR
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
