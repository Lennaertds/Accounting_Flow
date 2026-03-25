// backend/src/accounting/ledger-account.module.ts
import { Module } from '@nestjs/common';
import { LedgerAccountController } from './ledger-account.controller';
import { LedgerAccountService } from './ledger-account.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [LedgerAccountController],
    providers: [LedgerAccountService],
    exports: [LedgerAccountService],
})
export class LedgerAccountModule {}