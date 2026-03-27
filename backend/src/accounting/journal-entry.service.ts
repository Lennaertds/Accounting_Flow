// backend/src/accounting/journal-entry.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { journalEntries } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from './journal-entry.dto';

@Injectable()
export class JournalEntryService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAllByJournal(journalId: string | undefined, orgId: string) {
        const conditions = [eq(journalEntries.orgId, orgId)];
        
        if (journalId) {
            conditions.push(eq(journalEntries.journalId, journalId));
        }

        return await this.db
            .select()
            .from(journalEntries)
            .where(and(...conditions));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db
            .select()
            .from(journalEntries)
            .where(
                and(
                    eq(journalEntries.id, id), 
                    eq(journalEntries.orgId, orgId)
                )
            );

        if (!result.length) {
            throw new NotFoundException(`Journal Entry niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateJournalEntryDto, orgId: string) {
        const result = await this.db
            .insert(journalEntries)
            .values({
                ...dto,
                orgId: orgId
            })
            .returning();
        
        return result[0];
    }

    async update(id: string, orgId: string, dto: UpdateJournalEntryDto) {
        const { orgId: _, ...updateData } = dto;

        const result = await this.db
            .update(journalEntries)
            .set(updateData)
            .where(
                and(
                    eq(journalEntries.id, id), 
                    eq(journalEntries.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Journal Entry niet gevonden of geen wijzigingsrechten`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db
            .delete(journalEntries)
            .where(
                and(
                    eq(journalEntries.id, id), 
                    eq(journalEntries.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Journal Entry niet gevonden of geen verwijderrechten`);
        }
        return result[0];
    }
}