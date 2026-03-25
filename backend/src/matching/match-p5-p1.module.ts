// backend/src/accounting/match-p5-p1.module.ts
import { Module } from '@nestjs/common';
import { MatchP5P1Controller } from './match-p5-p1.controller';
import { MatchP5P1Service } from './match-p5-p1.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [MatchP5P1Controller],
    providers: [MatchP5P1Service],
    exports: [MatchP5P1Service],
})
export class MatchP5P1Module {}