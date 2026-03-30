// backend/src/accounting/bank-statement.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { bankStatements } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateBankStatementDto, UpdateBankStatementDto } from './bank-statement.dto';

@Injectable()
export class BankStatementService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db
            .select()
            .from(bankStatements)
            .where(eq(bankStatements.orgId, orgId));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db
            .select()
            .from(bankStatements)
            .where(
                and(
                    eq(bankStatements.id, id), 
                    eq(bankStatements.orgId, orgId)
                )
            );

        if (!result.length) {
            throw new NotFoundException(`Bankafschrift met ID ${id} niet gevonden binnen uw organisatie.`);
        }
        return result[0];
    }

    async create(dto: CreateBankStatementDto, orgId: string) {
        const insertValues = {
            ...dto,
            orgId: orgId,
            amount: dto.amount.toString() 
        };
        
        try {
            const result = await this.db.insert(bankStatements)
                .values(insertValues)
                .returning();
            return result[0];
        } catch (error) {
            console.error('Database Error bij aanmaken bankafschrift:', error);
            throw error;
        }
    }

    async update(id: string, orgId: string, dto: UpdateBankStatementDto) {
        const { orgId: _, ...updateData } = dto;

        const result = await this.db
            .update(bankStatements)
            .set({
                ...updateData,
                ...(updateData.amount && { amount: updateData.amount.toString() })
            })
            .where(
                and(
                    eq(bankStatements.id, id), 
                    eq(bankStatements.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Bankafschrift niet gevonden of geen wijzigingsrechten.`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db
            .delete(bankStatements)
            .where(
                and(
                    eq(bankStatements.id, id), 
                    eq(bankStatements.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Bankafschrift niet gevonden of geen verwijderrechten.`);
        }
        return result[0];
    }
}