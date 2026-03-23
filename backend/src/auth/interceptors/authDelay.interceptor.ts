// /backend/src/auth/interceptors/authDelay.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { delay, Observable } from 'rxjs';
import { ServerConfig } from '../../config/config.interface'

@Injectable()
export class AuthDelayInterceptor implements NestInterceptor {
    constructor(private configService: ConfigService<ServerConfig>) { }

    intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
        const authConfig = this.configService.get<ServerConfig['auth']>('auth');
        const maxDelay = authConfig?.maxDelay ?? 0;

        if (maxDelay <= 0) {
            return next.handle();
        }

        const randomDelay = Math.round(Math.random() * maxDelay);
        return next.handle().pipe(delay(randomDelay));
    }
}