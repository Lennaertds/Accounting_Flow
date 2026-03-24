// backend/src/accounting/journal.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { journals } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateJournalDto, UpdateJournalDto } from './journal.dto';

@Injectable()
export class JournalService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select().from(journals).where(eq(journals.orgId, orgId));
    }

    async create(dto: CreateJournalDto) {
        const result = await this.db.insert(journals).values(dto).returning();
        return result[0];
    }

    async update(id: string, dto: UpdateJournalDto) {
        const result = await this.db.update(journals)
            .set(dto)
            .where(eq(journals.id, id))
            .returning();
        return result[0];
    }

    async delete(id: string) {
        return await this.db.delete(journals).where(eq(journals.id, id));
    }
}