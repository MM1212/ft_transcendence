import { UseGuards, UseInterceptors, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { APIInterceptor } from '@/filters/Interceptor';

export function Auth() {
  return applyDecorators(UseGuards(AuthGuard), UseInterceptors(new APIInterceptor()));
}
