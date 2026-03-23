// backend/src/auth/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Session } from '../../types/auth'

export const User = createParamDecorator(
    (data: keyof Session | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as Session; 

        if (!user) {
            return null;
        }

        if (data) {
            return user[data];
        }

        return user;
    },
);