import { UseGuards, UseInterceptors, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { AuthRefreshTokenInterceptor } from '../middlewares/refresh.middleware';

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard),
    UseInterceptors(AuthRefreshTokenInterceptor),
  );
}
