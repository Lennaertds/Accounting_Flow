// src/auth/pipes/parseUserId.pipe.ts
import { 
    PipeTransform, 
    ArgumentMetadata, 
    Injectable, 
    BadRequestException, 
    Inject, 
    UnauthorizedException, 
    Scope 
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class ParseUserIdPipe implements PipeTransform {
    constructor(@Inject(REQUEST) private readonly request: any) { }

    async transform(value: any, metadata: ArgumentMetadata): Promise<number | string> {
        if (value === 'me') {
            const userId = this.request.user?.userId || this.request.user?.id;
            if (!userId) {
                console.log('[PIPE-DEBUG] User object in request:', this.request.user);
                throw new UnauthorizedException('Cannot use "me" without being authenticated');
            }
            return Number(userId);
        }
        const parsedId = parseInt(value, 10);
        if (isNaN(parsedId)) {
            throw new BadRequestException('User ID must be a numeric string or "me"');
        }
        return parsedId;
    }
}