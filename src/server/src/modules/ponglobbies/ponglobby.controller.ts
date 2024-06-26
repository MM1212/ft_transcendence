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
import { ObjectValidationPipe } from '@/helpers/decorators/validator';
import ponglobbyValidator from './ponglobby.validator';
import { PongService } from '../ponggame/pong.service';

const Targets = PongModel.Endpoints.Targets;

@Auth()
@Controller()
export class PongLobbyController {
  constructor(
    private readonly service: PongLobbyService,
    private readonly queueService: PongQueueService,
    private readonly ponggameService: PongService,
  ) {}

  @Post(Targets.UpdatePersonal)
  async updatePersonal(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.updatePersonalSchema))
    body: EndpointData<PongModel.Endpoints.UpdatePersonal>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.UpdatePersonal>> {
    console.log('BOAS');
    
    const lobby = await this.service.updatePersonal(
      ctx.user.id,
      body.lobbyId,
      body.paddleSkin,
      body.specialPower,
    );
    console.log(lobby);
    return lobby;
  }

  @Put(Targets.LeaveQueue)
  async leaveQueue(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.checkIdSchema))
    body: EndpointData<PongModel.Endpoints.LeaveLobby>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.LeaveLobby>> {
    const lobby = this.service.getLobbyByUser(ctx.user);
    if (lobby.id !== body.lobbyId)
      throw new BadRequestException('Lobby ID does not match');
    await this.queueService.leaveQueue(lobby, ctx.user.id);
  }

  @Put(Targets.AddToQueue)
  async addToQueue(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.checkIdSchema))
    body: EndpointData<PongModel.Endpoints.AddToQueue>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.AddToQueue>> {
    const lobby = await this.service.getLobby(body.lobbyId);
    this.queueService.addToQueue(lobby, ctx.user);
  }

  @Put(Targets.NewLobby)
  async newLobby(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.newLobbySchema))
    body: EndpointData<PongModel.Endpoints.NewLobby>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.NewLobby>> {
    const newLobby = await this.service.createLobby(ctx.user, body);
    return newLobby.interface;
  }

  @Put(Targets.LeaveLobby)
  async leaveLobby(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.checkIdSchema))
    body: EndpointData<PongModel.Endpoints.LeaveLobby>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.LeaveLobby>> {
    const lobby = this.service.getLobbyByUser(ctx.user);
    if (lobby.id !== body.lobbyId)
      throw new BadRequestException('Lobby ID does not match');
    await this.service.leaveLobby(ctx.user.id);
  }

  @Post(Targets.UpdateLobbySettings)
  async updateLobbySettings(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(
      new ObjectValidationPipe(ponglobbyValidator.updateLobbySettingsSchema),
    )
    body: EndpointData<PongModel.Endpoints.UpdateLobbySettings>,
  ): Promise<
    InternalEndpointResponse<PongModel.Endpoints.UpdateLobbySettings>
  > {
    await this.service.updateLobbySettings(
      ctx.user.id,
      body.lobbyId,
      body.score,
      body.type,
      body.ballSkin,
    );
    return (await this.service.getLobby(body.lobbyId)).interface;
  }

  @Post(Targets.StartGame)
  async startGame(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.checkIdSchema))
    body: EndpointData<PongModel.Endpoints.StartGame>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.StartGame>> {
    await this.service.startGame(ctx.user.id, body.lobbyId);
  }

  @Post(Targets.AddBot)
  async addBot(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.addBotSchema))
    body: EndpointData<PongModel.Endpoints.AddBot>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.AddBot>> {
    await this.service.addBot(
      ctx.user.id,
      body.lobbyId,
      body.teamId,
      body.teamPosition,
    );
  }

  @Post(Targets.JoinLobby)
  async joinLobby(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.joinLobbySchema))
    body: EndpointData<PongModel.Endpoints.JoinLobby>,
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
    @Body(new ObjectValidationPipe(ponglobbyValidator.changeTeamSchema))
    body: EndpointData<PongModel.Endpoints.ChangeTeam>,
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
    @Body(new ObjectValidationPipe(ponglobbyValidator.changeOwnerSchema))
    body: EndpointData<PongModel.Endpoints.ChangeOwner>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.ChangeOwner>> {
    await this.service.changeOwner(ctx.user.id, body.lobbyId, body.ownerToBe);
  }

  @Post(Targets.JoinSpectators)
  async joinSpectators(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.checkIdSchema))
    body: EndpointData<PongModel.Endpoints.JoinSpectators>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.JoinSpectators>> {
    await this.service.joinSpectators(ctx.user, body.lobbyId);
  }

  @Post(Targets.Ready)
  async ready(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.checkIdSchema))
    body: EndpointData<PongModel.Endpoints.Ready>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.Ready>> {
    await this.service.ready(ctx.user.id, body.lobbyId);
  }

  @Post(Targets.Kick)
  async kick(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.kickSchema))
    body: EndpointData<PongModel.Endpoints.Kick>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.Kick>> {
    await this.service.kick(ctx.user.id, body.lobbyId, body.userId);
  }

  @Post(Targets.Invite)
  async invite(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.inviteSchema))
    body: EndpointData<PongModel.Endpoints.Invite>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.Invite>> {
    const lobby = await this.service.invite(
      ctx.user,
      body.data,
      body.source,
      body.lobbyId,
    );
    return lobby.interface;
  }

  @Post(Targets.KickInvited)
  async kickInvited(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.kickSchema))
    body: EndpointData<PongModel.Endpoints.KickInvited>,
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
    const lobby = await this.service.getLobby(id);
    if (lobby.nonce !== nonce)
      throw new BadRequestException('Nonce does not match');
    return lobby.infoDisplay;
  }

  @Get(Targets.GetAllGames)
  async getAllGames(): Promise<
    InternalEndpointResponse<PongModel.Endpoints.GetAllGames>
  > {
    return this.ponggameService.getAllGames();
  }

  @Post(Targets.JoinActive)
  async joinActive(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body(new ObjectValidationPipe(ponglobbyValidator.joinActiveSchema))
    body: EndpointData<PongModel.Endpoints.JoinActive>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.JoinActive>> {
    const lobby = await this.ponggameService.joinActive(ctx.user, body.uuid);
    return lobby.interface;
  }
}
