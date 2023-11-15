import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';

export function SseAuth() {
  return applyDecorators(UseGuards(AuthGuard));
}
