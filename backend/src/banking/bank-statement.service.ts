// backend/src/accounting/bank-statement.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { bankStatements } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateBankStatementDto, UpdateBankStatementDto } from './bank-statement.dto';

@Injectable()
export class BankStatementService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select()
            .from(bankStatements)
            .where(eq(bankStatements.orgId, orgId));
    }

    async create(dto: CreateBankStatementDto) {
        const result = await this.db.insert(bankStatements)
            .values({
                ...dto,
                amount: dto.amount.toString() 
            })
            .returning();
        return result[0];
    }

    async delete(id: string) {
        const result = await this.db.delete(bankStatements)
            .where(eq(bankStatements.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Bankafschrift met ID ${id} niet gevonden`);
        }
        return result[0];
    }
}