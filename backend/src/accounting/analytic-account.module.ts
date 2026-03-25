// backend/src/accounting/analytic-account.module.ts
import { Module } from '@nestjs/common';
import { AnalyticAccountController } from './analytic-account.controller';
import { AnalyticAccountService } from './analytic-account.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [AnalyticAccountController],
    providers: [AnalyticAccountService],
    exports: [AnalyticAccountService],
})
export class AnalyticAccountModule {}