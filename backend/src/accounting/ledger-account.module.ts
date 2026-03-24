// backend/src/accounting/ledger-account.module.ts
import { Module } from '@nestjs/common';
import { LedgerAccountController } from './ledger-account.controller';
import { LedgerAccountService } from './ledger-account.service';

@Module({
    controllers: [LedgerAccountController],
    providers: [LedgerAccountService],
    exports: [LedgerAccountService],
})
export class LedgerAccountModule {}