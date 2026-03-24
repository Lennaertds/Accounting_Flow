// backend/src/accounting/transaction.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { transactions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';

@Injectable()
export class TransactionService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAllByEntry(entryId: string) {
        return await this.db.select()
            .from(transactions)
            .where(eq(transactions.entryId, entryId));
    }

    async create(dto: CreateTransactionDto) {
        const result = await this.db.insert(transactions)
            .values({
                entryId: dto.entryId,
                ledgerCode: dto.ledgerCode,
                analyticAccountId: dto.analyticAccountId,
                amount: dto.amount.toString(),
                isReconciled: dto.isReconciled || false
            })
            .returning();
        return result[0];
    }

    async update(id: string, dto: UpdateTransactionDto) {
        const updateData: any = { ...dto };
        
        if (dto.amount !== undefined) {
            updateData.amount = dto.amount.toString();
        }

        const result = await this.db.update(transactions)
            .set(updateData)
            .where(eq(transactions.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Transactie met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async delete(id: string) {
        const result = await this.db.delete(transactions)
            .where(eq(transactions.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Transactie met ID ${id} niet gevonden`);
        }
        return result[0];
    }
}