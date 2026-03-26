// backend/src/accounting/ledger-account.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { ledgerAccounts } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateLedgerAccountDto, UpdateLedgerAccountDto } from './ledger-account.dto';

@Injectable()
export class LedgerAccountService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select()
            .from(ledgerAccounts)
            .where(eq(ledgerAccounts.orgId, orgId));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db.select()
            .from(ledgerAccounts)
            .where(
                and(
                    eq(ledgerAccounts.id, id), 
                    eq(ledgerAccounts.orgId, orgId)
                )
            );
            
        if (!result.length) {
            throw new NotFoundException(`Grootboekrekening met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateLedgerAccountDto, orgId: string) {
        try {
            const result = await this.db.insert(ledgerAccounts)
                .values({
                    ...dto,
                    orgId: orgId 
                })
                .returning();
            return result[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(`Rekeningnummer ${dto.code} bestaat al binnen deze organisatie`);
            }
            throw error;
        }
    }

    async update(id: string, orgId: string, dto: UpdateLedgerAccountDto) {
        const { orgId: _, ...updateData } = dto;

        const result = await this.db.update(ledgerAccounts)
            .set(updateData) 
            .where(
                and(
                    eq(ledgerAccounts.id, id),
                    eq(ledgerAccounts.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Grootboekrekening niet gevonden of geen wijzigingsrechten`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db.delete(ledgerAccounts)
            .where(
                and(
                    eq(ledgerAccounts.id, id),
                    eq(ledgerAccounts.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Grootboekrekening niet gevonden of geen verwijderrechten`);
        }
        return result[0];
    }
}