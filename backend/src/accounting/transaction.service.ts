// backend/src/accounting/transaction.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { transactions } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';

@Injectable()
export class TransactionService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select()
            .from(transactions)
            .where(eq(transactions.orgId, orgId));
    }

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

    async findOne(id: string, orgId: string) {
        const result = await this.db.select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.id, id), 
                    eq(transactions.orgId, orgId)
                )
            );
        if (!result.length) throw new NotFoundException(`Transactie niet gevonden`);
        return result[0];
    }

    async create(dto: CreateTransactionDto, orgId: string) {
        try {
            const result = await this.db.insert(transactions)
                .values({
                    ...dto,
                    orgId: orgId, 
                    amount: dto.amount.toFixed(2), 
                    isReconciled: dto.isReconciled ?? false
                })
                .returning();
            return result[0];
        } catch (error) {
            console.error('Transaction Create Error:', error);
            throw new BadRequestException('Kon transactie niet aanmaken. Controleer de ID\'s.');
        }
    }

    async update(id: string, orgId: string, dto: UpdateTransactionDto) {
        const { orgId: _, entryId: __, ...updateData } = dto;
        
        const finalUpdate: any = { ...updateData };

        if (dto.amount !== undefined) {
            finalUpdate.amount = dto.amount.toFixed(2);
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