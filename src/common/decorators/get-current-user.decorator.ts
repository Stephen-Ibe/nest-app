import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtRTPayload } from 'src/types';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtRTPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
