// backend/src/accounting/bank-statement.module.ts
import { Module } from '@nestjs/common';
import { BankStatementController } from './bank-statement.controller';
import { BankStatementService } from './bank-statement.service';

@Module({
    controllers: [BankStatementController],
    providers: [BankStatementService],
    exports: [BankStatementService],
})
export class BankStatementModule {}