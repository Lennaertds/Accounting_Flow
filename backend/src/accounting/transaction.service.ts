// backend/src/accounting/transaction.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { transactions } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';

@Injectable()
export class TransactionService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAllByEntry(entryId: string, orgId: string) {
        return await this.db.select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.entryId, entryId),
                    eq(transactions.orgId, orgId)
                )
            );
    }

    async create(dto: CreateTransactionDto, orgId: string) {
        const result = await this.db.insert(transactions)
            .values({
                orgId: orgId, 
                entryId: dto.entryId,
                ledgerId: dto.ledgerId,
                analyticAccountId: dto.analyticAccountId,
                amount: dto.amount.toString(),
                isReconciled: dto.isReconciled || false
            })
            .returning();
        return result[0];
    }

    async update(id: string, orgId: string, dto: UpdateTransactionDto) {
        const { orgId: _, entryId: __, ...updateData } = dto;
        
        const finalUpdate: any = { ...updateData };
        if (dto.amount !== undefined) {
            finalUpdate.amount = dto.amount.toString();
        }

        const result = await this.db.update(transactions)
            .set(finalUpdate)
            .where(
                and(
                    eq(transactions.id, id), 
                    eq(transactions.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Transactie niet gevonden of geen wijzigingsrechten`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db.delete(transactions)
            .where(
                and(
                    eq(transactions.id, id), 
                    eq(transactions.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Transactie niet gevonden`);
        }
        return result[0];
    }
}