// backend/src/auth/guards/userAccess.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { Role } from '../roles'; 
import { Session } from '../../types/auth'; 

@Injectable()
export class CheckUserAccessGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user as Session; 

        if (!user) {
            throw new UnauthorizedException('You need to be signed in');
        }

        const authenticatedUserId = user.userId; 
        const targetId = request.params.id; 

        if (
            targetId !== 'me' &&
            targetId !== String(authenticatedUserId) &&
            !user.roles.includes(Role.ADMIN)
        ) {
            throw new ForbiddenException('You do not have permission to access this profile');
        }

        return true;
    }
}