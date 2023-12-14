import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import User from '@/modules/users/user';
import { Socket } from 'socket.io';

const preCtx = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User => {
    const client = ctx.switchToWs().getClient<Socket>();
    return client.data.user;
  },
);

const GatewayUser = preCtx;

export default GatewayUser;
