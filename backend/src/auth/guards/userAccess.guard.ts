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

        const authenticatedUserId = String(user.userId); 
        const targetId = String(request.params.id); 

        // 1. Iedereen mag bij zijn eigen data via 'me'
        if (targetId === 'me') return true;

        // 2. Iedereen mag bij zijn eigen data via zijn eigen UUID
        if (targetId === authenticatedUserId) return true;

        // 3. Alleen ADMIN mag bij anderen
        const isAdmin = user.role === Role.ADMIN;
        if (!isAdmin) {
            throw new ForbiddenException('You do not have permission to access this profile');
        }

        return true;
    }
}