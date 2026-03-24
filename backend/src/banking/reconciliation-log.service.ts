// backend/src/accounting/reconciliation-log.service
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { reconciliationLogs, transactions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateReconciliationLogDto } from './reconciliation-log.dto';

@Injectable()
export class ReconciliationLogService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async create(dto: CreateReconciliationLogDto) {
        return await this.db.transaction(async (tx) => {
            const log = await tx.insert(reconciliationLogs)
                .values({
                    transactionId: dto.transactionId,
                    bankStatementId: dto.bankStatementId,
                    journalEntryId: dto.journalEntryId,
                    matchType: dto.matchType || 'MANUAL',
                    reconciledAt: new Date(dto.reconciledAt),
                })
                .returning();
            
            const updated = await tx.update(transactions)
                .set({ isReconciled: true })
                .where(eq(transactions.id, dto.transactionId))
                .returning();

            if (!updated.length) {
                throw new NotFoundException(`Transactie met ID ${dto.transactionId} niet gevonden`);
            }
                
            return log[0];
        });
    }

    async findByTransaction(transactionId: string) {
        return await this.db.select()
            .from(reconciliationLogs)
            .where(eq(reconciliationLogs.transactionId, transactionId));
    }
}