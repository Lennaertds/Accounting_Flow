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

@Injectable() 
export class ParseUserIdPipe implements PipeTransform {
    
    async transform(value: any, metadata: ArgumentMetadata): Promise<string> {
        if (value === 'me') {
            return value;
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            throw new BadRequestException('User ID must be a valid UUID or "me"');
        }

        return value;
    }
}