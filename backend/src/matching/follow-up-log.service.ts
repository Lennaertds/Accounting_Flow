// backend/src/accounting/follow-up-log.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { followUpLogs } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateFollowUpLogDto, UpdateFollowUpLogDto } from './follow-up-log.dto';

@Injectable()
export class FollowUpLogService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db
            .select()
            .from(followUpLogs)
            .where(eq(followUpLogs.orgId, orgId));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db
            .select()
            .from(followUpLogs)
            .where(
                and(
                    eq(followUpLogs.id, id),
                    eq(followUpLogs.orgId, orgId)
                )
            );

        if (!result.length) {
            throw new NotFoundException(`Follow-up log met ID ${id} niet gevonden.`);
        }
        return result[0];
    }

    async findByMatch(matchId: string, type: 'P5P1' | 'P2P4', orgId: string) {
        const column = type === 'P5P1' ? followUpLogs.matchP5P1Id : followUpLogs.matchP2P4Id;
        
        return await this.db
            .select()
            .from(followUpLogs)
            .where(
                and(
                    eq(column, matchId),
                    eq(followUpLogs.orgId, orgId)
                )
            );
    }

    async create(dto: CreateFollowUpLogDto, orgId: string) {
        const insertValues = {
            ...dto,
            orgId: orgId 
        };

        try {
            const result = await this.db.insert(followUpLogs)
                .values(insertValues)
                .returning();
            return result[0];
        } catch (error) {
            console.error('Database Error bij aanmaken follow-up log:', error);
            throw error;
        }
    }

    async update(id: string, orgId: string, dto: UpdateFollowUpLogDto) {
        const { orgId: _, ...updateData } = dto;

        const result = await this.db
            .update(followUpLogs)
            .set(updateData)
            .where(
                and(
                    eq(followUpLogs.id, id),
                    eq(followUpLogs.orgId, orgId)
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
            .delete(followUpLogs)
            .where(
                and(
                    eq(followUpLogs.id, id),
                    eq(followUpLogs.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Log niet gevonden of geen verwijderrechten.`);
        }
        return result[0];
    }
}