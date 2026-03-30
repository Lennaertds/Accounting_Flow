// backend/src/accounting/reconciliation-log.service
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { reconciliationLogs } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateReconciliationLogDto, UpdateReconciliationLogDto } from './reconciliation-log.dto';

@Injectable()
export class ReconciliationLogService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db
            .select()
            .from(reconciliationLogs)
            .where(eq(reconciliationLogs.orgId, orgId));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db
            .select()
            .from(reconciliationLogs)
            .where(
                and(
                    eq(reconciliationLogs.id, id),
                    eq(reconciliationLogs.orgId, orgId)
                )
            );

        if (!result.length) {
            throw new NotFoundException(`Reconciliation log met ID ${id} niet gevonden.`);
        }
        return result[0];
    }

    async findByTransaction(transactionId: string, orgId: string) {
        const results = await this.db
            .select()
            .from(reconciliationLogs)
            .where(
                and(
                    eq(reconciliationLogs.transactionId, transactionId),
                    eq(reconciliationLogs.orgId, orgId)
                )
            );

        if (!results.length) {
            throw new NotFoundException(`Geen logs gevonden voor transactie ${transactionId} binnen uw organisatie.`);
        }
        return results;
    }

    async create(dto: CreateReconciliationLogDto, orgId: string) {
        const { orgId: _, ...logData } = dto;
        
        const insertValues = {
            ...logData,
            orgId: orgId,
            matchType: dto.matchType ?? 'MANUAL', 
            reconciledAt: dto.reconciledAt ? new Date(dto.reconciledAt) : new Date(),
        };

        try {
            const result = await this.db.insert(reconciliationLogs)
                .values(insertValues) 
                .returning();
            return result[0];
        } catch (error) {
            console.error('Database Error bij aanmaken reconciliation log:', error);
            throw error;
        }
    }

    async update(id: string, orgId: string, dto: UpdateReconciliationLogDto) {
        const { orgId: _, ...updateData } = dto;

        const result = await this.db
            .update(reconciliationLogs)
            .set({
                ...updateData,
                reconciledAt: updateData.reconciledAt ? new Date(updateData.reconciledAt) : undefined
            })
            .where(
                and(
                    eq(reconciliationLogs.id, id),
                    eq(reconciliationLogs.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Log niet gevonden of geen wijzigingsrechten.`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db
            .delete(reconciliationLogs)
            .where(
                and(
                    eq(reconciliationLogs.id, id),
                    eq(reconciliationLogs.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Log niet gevonden of geen verwijderrechten.`);
        }
        return result[0];
    }
}