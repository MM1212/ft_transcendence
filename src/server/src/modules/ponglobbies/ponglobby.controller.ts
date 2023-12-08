import PongModel from '@typings/models/pong';
import { Auth } from '../auth/decorators';
import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import { Endpoint, EndpointData, InternalEndpointResponse } from '@typings/api';
import { PongLobbyService } from './ponglobby.service';

const Targets = PongModel.Endpoints.Targets;

class NewLobbyDataDto implements EndpointData<PongModel.Endpoints.NewLobby> {
  password: string | null = null;
  name!: string;
  spectators!: PongModel.Models.LobbySpectatorVisibility;
  lobbyType!: PongModel.Models.LobbyType;
  gameType!: PongModel.Models.LobbyGameType;
}



@Auth()
@Controller()
export class PongLobbyController {
  constructor(private readonly service: PongLobbyService) {}

  @Put(Targets.NewLobby)
  async newLobby(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: NewLobbyDataDto,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.NewLobby>> {
    console.log();
    
    const newLobby = await this.service.createLobby(ctx.user, body);
    return newLobby.interface;
  }

  @Put(Targets.LeaveLobby)
  async leaveLobby(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.LeaveLobby>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.LeaveLobby>> {
    const lobby = await this.service.getLobby(ctx.user);
    if (lobby.id !== body.lobbyId)
      throw new BadRequestException('Lobby ID does not match');
    await this.service.leaveLobby(ctx.user);
  }

  @Post(Targets.JoinLobby)
  async joinLobby(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.JoinLobby>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.JoinLobby>> {    
    const lobby = await this.service.joinLobby(ctx.user, body.lobbyId, body.password);
    return lobby.interface;
  }

  @Post(Targets.ChangeTeam)
  async changeTeam(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() body: EndpointData<PongModel.Endpoints.ChangeTeam>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.ChangeTeam>> {
    await this.service.changeTeam(ctx.user.id, body.teamId, body.teamPosition, body.lobbyId);
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

  @Get(Targets.GetSessionLobby)
  async getSessionLobby(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<PongModel.Endpoints.GetSessionLobby>> {
    const lobby = await this.service.getLobby(ctx.user);
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
}
