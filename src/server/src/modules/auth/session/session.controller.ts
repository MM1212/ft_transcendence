import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UnauthorizedException,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from '@/modules/auth/decorators';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import * as API from '@typings/api';
import { SessionService } from './session.service';
import { APIInterceptor } from '@/filters/Interceptor';

@Controller()
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Auth()
  @Get(API.AuthModel.Endpoints.Targets.Session)
  async me(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<API.InternalEndpointResponse<API.AuthModel.Endpoints.Session>> {
    const { user } = ctx;
    if (user.session.dummy) return user.publicSession;
    if (!user.session.auth.isTokenValid()) {
      user.session.logout();
      throw new UnauthorizedException();
    }
    return user.publicSession;
  }

  @Auth()
  @Post(API.AuthModel.Endpoints.Targets.TfaSetup)
  async tfaSetup(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<API.InternalEndpointResponse<API.AuthModel.Endpoints.TfaSetup>> {
    const { user } = ctx;
    return await this.service.handleTfaSetup(user);
  }

  @Auth()
  @Post(API.AuthModel.Endpoints.Targets.TfaSetupConfirm)
  async tfaSetupConfirm(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body('code', new ValidationPipe({ errorHttpStatusCode: 400 }))
    code: string,
  ): Promise<
    API.InternalEndpointResponse<API.AuthModel.Endpoints.TfaSetupConfirm>
  > {
    if (code.length !== 6) throw new BadRequestException('Invalid code');
    await this.service.handleTfaSetupConfirm(ctx.user, code);
  }

  @Auth()
  @Get(API.AuthModel.Endpoints.Targets.TfaQrCode)
  async tfaQrCode(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<API.InternalEndpointResponse<API.AuthModel.Endpoints.TfaQrCode>> {
    const { user } = ctx;
    return await this.service.getTfaQrCode(user);
  }

  @Auth()
  @Post(API.AuthModel.Endpoints.Targets.TfaDisable)
  async tfaDisable(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body('code', new ValidationPipe({ errorHttpStatusCode: 400 }))
    code: string,
  ): Promise<API.InternalEndpointResponse<API.AuthModel.Endpoints.TfaDisable>> {
    if (code.length !== 6) throw new BadRequestException('Invalid code');
    const { user } = ctx;
    await this.service.handleTfaDisable(user, code);
  }

  @UseInterceptors(new APIInterceptor())
  @Get(API.AuthModel.Endpoints.Targets.IsLoggingInTFA)
  async isLoggingInTFA(
    @HttpCtx() ctx: HTTPContext<false>,
  ): Promise<
    API.InternalEndpointResponse<API.AuthModel.Endpoints.IsLoggingInTFA>
  > {
    const { session } = ctx;
    return !!session.get('tfa_login');
  }

  @UseInterceptors(new APIInterceptor())
  @Post(API.AuthModel.Endpoints.Targets.TfaCallback)
  async tfaCallback(
    @HttpCtx() ctx: HTTPContext<false>,
    @Body() body: any,
    @Body('code')
    code: string,
  ): Promise<
    API.InternalEndpointResponse<API.AuthModel.Endpoints.TfaCallback>
  > {
    if (code.length !== 6) throw new BadRequestException('Invalid code');
    const { session } = ctx;
    const tfaLogin = session.get('tfa_login');
    if (!tfaLogin) throw new ForbiddenException();
    const userId = session.get('tfa_user_id')
    if (!userId) throw new ForbiddenException();

    await this.service.handleTfaCallback(userId, session, code);
  }
}
