import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { journals } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateJournalDto, UpdateJournalDto, JournalType } from './journal.dto';

@Injectable()
export class JournalService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db
            .select()
            .from(journals)
            .where(eq(journals.orgId, orgId));
    }

   
    async findOne(id: string, orgId: string) {
        const result = await this.db
            .select()
            .from(journals)
            .where(
                and(
                    eq(journals.id, id), 
                    eq(journals.orgId, orgId)
                )
            );

        if (!result.length) {
            throw new NotFoundException(`Dagboek met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateJournalDto, orgId: string) {
        try {
            const result = await this.db.insert(journals)
                .values({
                    ...dto,
                    orgId: orgId 
                })
                .returning();
            return result[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException(`Code '${dto.code}' is al in gebruik voor een dagboek.`);
            }
            throw error;
        }
    }

    async update(id: string, orgId: string, dto: UpdateJournalDto) {
        const { orgId: _, code: __, ...updateData } = dto;

        const result = await this.db
            .update(journals)
            .set(updateData)
            .where(
                and(
                    eq(journals.id, id), 
                    eq(journals.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Dagboek niet gevonden of geen wijzigingsrechten`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db
            .delete(journals)
            .where(
                and(
                    eq(journals.id, id), 
                    eq(journals.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Dagboek niet gevonden of geen verwijderrechten`);
        }
        return result[0];
    }

    async seedStandardJournals(orgId: string) {
        const standards = [
            { orgId, name: 'Inkoopboek', code: 'INK', type: JournalType.PURCHASE },
            { orgId, name: 'Verkoopboek', code: 'VRK', type: JournalType.SALE },
            { orgId, name: 'Bank', code: 'BNK', type: JournalType.BANK },
            { orgId, name: 'Diverse Posten', code: 'DIV', type: JournalType.GENERAL },
        ];

        return await this.db.insert(journals).values(standards).returning();
    }
}