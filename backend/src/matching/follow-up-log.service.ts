// backend/src/accounting/follow-up-log.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { followUpLogs } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateFollowUpLogDto } from './follow-up-log.dto';

@Injectable()
export class FollowUpLogService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAllByOrg(orgId: string) {
        return await this.db.select()
            .from(followUpLogs)
            .where(eq(followUpLogs.orgId, orgId));
    }

    async create(dto: CreateFollowUpLogDto) {
        const result = await this.db.insert(followUpLogs)
            .values(dto)
            .returning();
        return result[0];
    }

    async findByMatch(matchId: string, type: 'P5P1' | 'P2P4') {
        const column = type === 'P5P1' ? followUpLogs.matchP5P1Id : followUpLogs.matchP2P4Id;
        return await this.db.select()
            .from(followUpLogs)
            .where(eq(column, matchId));
    }
}