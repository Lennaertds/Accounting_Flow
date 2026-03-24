// backend/src/accounting/analytic-account.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { analyticAccounts } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateAnalyticAccountDto, UpdateAnalyticAccountDto } from './analytic-account.dto';

@Injectable()
export class AnalyticAccountService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select().from(analyticAccounts).where(eq(analyticAccounts.orgId, orgId));
    }

    async create(dto: CreateAnalyticAccountDto) {
        const result = await this.db.insert(analyticAccounts).values({
            name: dto.name,
            orgId: dto.orgId,
            code: (dto as any).code || 'DEFAULT', 
            active: true,
            }).returning();
        return result[0];
    }

    async update(id: string, dto: UpdateAnalyticAccountDto) {
        const result = await this.db.update(analyticAccounts)
            .set(dto)
            .where(eq(analyticAccounts.id, id))
            .returning();
        return result[0];
    }

    async delete(id: string) {
        return await this.db.delete(analyticAccounts).where(eq(analyticAccounts.id, id));
    }
}