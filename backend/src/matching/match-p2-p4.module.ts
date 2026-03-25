// backend/src/accounting/match-p2-p4.module.ts
import { Module } from '@nestjs/common';
import { MatchP2P4Controller } from './match-p2-p4.controller';
import { MatchP2P4Service } from './match-p2-p4.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [MatchP2P4Controller],
    providers: [MatchP2P4Service],
    exports: [MatchP2P4Service],
})
export class MatchP2P4Module {}