// backend/src/accounting/ledger-account.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { ledgerAccounts } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateLedgerAccountDto, UpdateLedgerAccountDto } from './ledger-account.dto';

@Injectable()
export class LedgerAccountService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select()
            .from(ledgerAccounts)
            .where(eq(ledgerAccounts.orgId, orgId));
    }

    async findOne(id: string) {
        const account = await this.db.select()
            .from(ledgerAccounts)
            .where(eq(ledgerAccounts.id, id));
            
        if (!account.length) {
            throw new NotFoundException(`Grootboekrekening met ID ${id} niet gevonden`);
        }
        return account[0];
    }

    async create(dto: CreateLedgerAccountDto) {
        const result = await this.db.insert(ledgerAccounts)
            .values(dto)
            .returning();
        return result[0];
    }

    async update(id: string, dto: UpdateLedgerAccountDto) {
        const result = await this.db.update(ledgerAccounts)
            .set(dto) 
            .where(eq(ledgerAccounts.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Grootboekrekening met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async delete(id: string) {
        const result = await this.db.delete(ledgerAccounts)
            .where(eq(ledgerAccounts.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Grootboekrekening met ID ${id} niet gevonden`);
        }
        return result[0];
    }
}