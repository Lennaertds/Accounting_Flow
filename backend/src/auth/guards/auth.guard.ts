// backend/src/auth/guards/auth.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        // console.log(`[AUTH-DEBUG] URL: ${request.url}`);
        // console.log(`[AUTH-DEBUG] Token gevonden: ${!!token}`);

        if (!token) {
            throw new UnauthorizedException('You need to be signed in');
        }

        try {
            const secret = this.configService.get<string>('AUTH_JWT_SECRET');
            // DEBUG: Is het geheim wel geladen in de testomgeving?
            // console.log(`[AUTH-DEBUG] JWT Secret aanwezig: ${!!secret}`);

            const payload = await this.jwtService.verifyAsync(token, { secret });
            
            request['user'] = {
                ...payload,
                userId: payload.sub,
            };
            
            // console.log(`[AUTH-DEBUG] Payload geverifieerd voor user: ${payload.sub}`);
            return true;
        } catch (e) {
            console.error(`[AUTH-DEBUG] Verificatie mislukt: ${e.message}`);
            throw new UnauthorizedException('Invalid authentication token');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type?.toLowerCase() === 'bearer' ? token : undefined;
    }
}