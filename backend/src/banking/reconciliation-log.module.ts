// backend/src/accounting/reconciliation-log.module.ts
import { Module } from '@nestjs/common';
import { ReconciliationLogController } from './reconciliation-log.controller';
import { ReconciliationLogService } from './reconciliation-log.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [ReconciliationLogController],
    providers: [ReconciliationLogService],
    exports: [ReconciliationLogService],
})
export class ReconciliationLogModule {}