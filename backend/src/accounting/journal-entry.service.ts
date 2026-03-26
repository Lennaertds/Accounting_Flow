// backend/src/accounting/journal-entry.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { journalEntries } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from './journal-entry.dto';

@Injectable()
export class JournalEntryService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAllByJournal(journalId: string) {
        return await this.db.select().from(journalEntries).where(eq(journalEntries.journalId, journalId));
    }

    async findOne(id: string) {
        const entry = await this.db.select().from(journalEntries).where(eq(journalEntries.id, id));
        if (!entry.length) {
            throw new NotFoundException(`Journal Entry met ID ${id} niet gevonden`);
        }
        return entry[0];
    }

    async create(dto: CreateJournalEntryDto, orgId: string) {
        const result = await this.db.insert(journalEntries)
            .values({
                ...dto,
                orgId: orgId 
            })
            .returning();
        return result[0];
    }

    async update(id: string, dto: UpdateJournalEntryDto) {
        const result = await this.db.update(journalEntries)
            .set(dto)
            .where(eq(journalEntries.id, id))
            .returning();
        
        if (!result.length) {
            throw new NotFoundException(`Journal Entry met ID ${id} kon niet worden bijgewerkt`);
        }
        return result[0];
    }

    async delete(id: string) {
        const result = await this.db.delete(journalEntries).where(eq(journalEntries.id, id)).returning();
        if (!result.length) {
            throw new NotFoundException(`Journal Entry met ID ${id} kon niet worden verwijderd`);
        }
        return result[0];
    }
}