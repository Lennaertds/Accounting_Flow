// backend/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../roles';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../../types/auth'; 

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(), 
            context.getClass(),   
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as JwtPayload;

        const hasRequiredRole = requiredRoles.some((role) => user.roles?.includes(role));

        if (!hasRequiredRole) {
            throw new ForbiddenException('You do not have the required permissions to access this resource.');
        }

        return true;
    }
}