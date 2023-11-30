import { APIInterceptor } from '@/filters/Interceptor';
import HttpCtx from '@/helpers/decorators/httpCtx';
import {
  Post,
  Body,
  ValidationPipe,
  BadRequestException,
  Get,
  UseInterceptors,
  ForbiddenException,
  Controller,
} from '@nestjs/common';
import { AuthModel, InternalEndpointResponse } from '@typings/api';
import { HTTPContext } from '@typings/http';
import { Auth } from '../decorators';
import { TfaService } from './2fa.service';

@Controller()
export class TfaController {
  constructor(private readonly service: TfaService) {}

  @Auth()
  @Post(AuthModel.Endpoints.Targets.TfaSetup)
  async tfaSetup(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<AuthModel.Endpoints.TfaSetup>> {
    const { user } = ctx;
    return await this.service.setup(user);
  }

  @Auth()
  @Post(AuthModel.Endpoints.Targets.TfaSetupConfirm)
  async tfaSetupConfirm(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body('code', new ValidationPipe({ errorHttpStatusCode: 400 }))
    code: string,
  ): Promise<InternalEndpointResponse<AuthModel.Endpoints.TfaSetupConfirm>> {
    if (code.length !== 6) throw new BadRequestException('Invalid code');
    await this.service.setupConfirm(ctx.user, code);
  }

  @Auth()
  @Get(AuthModel.Endpoints.Targets.TfaQrCode)
  async tfaQrCode(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<AuthModel.Endpoints.TfaQrCode>> {
    const { user } = ctx;
    return await this.service.getQrCode(user);
  }

  @Auth()
  @Post(AuthModel.Endpoints.Targets.TfaDisable)
  async tfaDisable(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body('code', new ValidationPipe({ errorHttpStatusCode: 400 }))
    code: string,
  ): Promise<InternalEndpointResponse<AuthModel.Endpoints.TfaDisable>> {
    if (code.length !== 6) throw new BadRequestException('Invalid code');
    const { user } = ctx;
    await this.service.disable(user, code);
  }

  @UseInterceptors(new APIInterceptor())
  @Get(AuthModel.Endpoints.Targets.IsLoggingInTFA)
  async isLoggingInTFA(
    @HttpCtx() ctx: HTTPContext<false>,
  ): Promise<InternalEndpointResponse<AuthModel.Endpoints.IsLoggingInTFA>> {
    const { session } = ctx;
    return !!session.get('tfa_login');
  }

  @UseInterceptors(new APIInterceptor())
  @Post(AuthModel.Endpoints.Targets.TfaCallback)
  async tfaCallback(
    @HttpCtx() ctx: HTTPContext<false>,
    @Body() body: any,
    @Body('code')
    code: string,
  ): Promise<InternalEndpointResponse<AuthModel.Endpoints.TfaCallback>> {
    if (code.length !== 6) throw new BadRequestException('Invalid code');
    const { session } = ctx;
    const tfaLogin = session.get('tfa_login');
    if (!tfaLogin) throw new ForbiddenException();
    const userId = session.get('tfa_user_id');
    if (!userId) throw new ForbiddenException();

    await this.service.callback(userId, session, code);
  }
}
