// backend/src/session/session.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { SessionController } from './session.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule, 
    AuthModule
  ],
  controllers: [SessionController],
})
export class SessionModule { }