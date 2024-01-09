import PongModel from '@typings/models/pong';
import { Auth } from '../auth/decorators';
import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import { EndpointData, InternalEndpointResponse } from '@typings/api';
import { PongLobbyService } from './ponglobby.service';
import { PongQueueService } from '../pongqueue/pongqueue.service';

const Targets = PongModel.Endpoints.Targets;

@Auth()
@Controller()
export class PongLobbyController {
  constructor(
    private readonly service: PongLobbyService,
    private readonly queueService: PongQueueService,
  ) {}

  @Put(Targets.AddToQueue)
  async addToQueue(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.AddToQueue>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.AddToQueue>> {
    const lobby = await this.service.getLobby(body.lobbyId)
    this.queueService.addToQueue(lobby, ctx.user);
    //TODO: return
  }

  @Put(Targets.NewLobby)
  async newLobby(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.NewLobby>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.NewLobby>> {
    const newLobby = await this.service.createLobby(ctx.user, body);
    return newLobby.interface;
  }

  @Put(Targets.LeaveLobby)
  async leaveLobby(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.LeaveLobby>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.LeaveLobby>> {
    const lobby = this.service.getLobbyByUser(ctx.user);
    if (lobby.id !== body.lobbyId)
      throw new BadRequestException('Lobby ID does not match');
    await this.service.leaveLobby(ctx.user.id);
  }

  @Post(Targets.StartGame)
  async startGame(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.StartGame>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.StartGame>> {
    await this.service.startGame(ctx.user.id, body.lobbyId);
  }

  @Post(Targets.JoinLobby)
  async joinLobby(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.JoinLobby>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.JoinLobby>> {
    const lobby = await this.service.joinLobby(
      ctx.user,
      body.lobbyId,
      body.password,
      body.nonce,
    );
    return lobby.interface;
  }

  @Post(Targets.ChangeTeam)
  async changeTeam(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.ChangeTeam>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.ChangeTeam>> {
    await this.service.changeTeam(
      ctx.user.id,
      body.teamId,
      body.teamPosition,
      body.lobbyId,
    );
  }

  @Post(Targets.ChangeOwner)
  async changeOwner(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.ChangeOwner>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.ChangeOwner>> {
    await this.service.changeOwner(ctx.user.id, body.lobbyId, body.ownerToBe);
  }

  @Post(Targets.JoinSpectators)
  async joinSpectators(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.JoinSpectators>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.JoinSpectators>> {
    await this.service.joinSpectators(ctx.user, body.lobbyId);
  }

  @Post(Targets.Ready)
  async ready(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.Ready>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.Ready>> {
    await this.service.ready(ctx.user.id, body.lobbyId);
  }

  @Post(Targets.Kick)
  async kick(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.Kick>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.Kick>> {
    await this.service.kick(ctx.user.id, body.lobbyId, body.userId);
  }

  @Post(Targets.Invite)
  async invite(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.Invite>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.Invite>> {
    console.log(body);
    const lobby = await this.service.invite(ctx.user, body.data, body.source, body.lobbyId);
    return lobby.interface;
  }

  @Post(Targets.KickInvited)
  async kickInvited(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.KickInvited>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.KickInvited>> {
    await this.service.kickInvited(ctx.user.id, body.lobbyId, body.userId);
  }

  @Get(Targets.GetSessionLobby)
  async getSessionLobby(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.GetSessionLobby>> {
    const lobby = this.service.getLobbyByUser(ctx.user);
    return lobby.interface;
  }

  @Get(Targets.GetAllLobbies)
  async getAllLobbies(
    @Query('active', new DefaultValuePipe(false), new ParseBoolPipe())
    active: boolean,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.GetAllLobbies>> {
    const lobbies = await this.service.getAllLobbies();
    return lobbies.filter((lobby) =>
      active
        ? lobby.status === PongModel.Models.LobbyStatus.Playing
        : lobby.status !== PongModel.Models.LobbyStatus.Playing,
    );
  }

  @Get(Targets.GetLobby)
  async getLobby(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Query('nonce', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    nonce: number,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.GetLobby>> {
    console.log(id, typeof id);

    const lobby = await this.service.getLobby(id);
    if (lobby.nonce !== nonce)
      throw new BadRequestException('Nonce does not match');
    return lobby.infoDisplay;
  }
}
