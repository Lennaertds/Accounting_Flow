// backend/src/auth/auth.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DrizzleModule } from '../drizzle/drizzle.module'
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            global: true,
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('AUTH_JWT_SECRET');

                if (!secret) {
                    throw new Error("FATAL: Environment variable AUTH_JWT_SECRET is missing.");
                }

                const expirationSeconds = configService.get<number>('JWT_EXPIRATION', 3600);
                const audience = configService.get<string>('AUTH_JWT_AUDIENCE', 'budget.hogent.be');
                const issuer = configService.get<string>('AUTH_JWT_ISSUER', 'budget.hogent.be');

                return {
                    secret: secret,
                    signOptions: {
                        expiresIn: `${expirationSeconds}s`, 
                        audience: audience,
                        issuer: issuer,
                    },
                };
            },
            imports: [ConfigModule]
        }),
        ConfigModule,
        DrizzleModule,
        forwardRef(() => UserModule),
    ],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule { }