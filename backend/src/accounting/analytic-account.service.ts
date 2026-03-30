// backend/src/accounting/analytic-account.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { analyticAccounts } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateAnalyticAccountDto, UpdateAnalyticAccountDto } from './analytic-account.dto';

@Injectable()
export class AnalyticAccountService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db
            .select()
            .from(analyticAccounts)
            .where(eq(analyticAccounts.orgId, orgId));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db
            .select()
            .from(analyticAccounts)
            .where(
                and(
                    eq(analyticAccounts.id, id), 
                    eq(analyticAccounts.orgId, orgId)
                )
            );

        if (!result.length) {
            throw new NotFoundException(`Kostenplaats met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateAnalyticAccountDto, orgId: string) {
        try {
            const result = await this.db.insert(analyticAccounts)
                .values({
                    ...dto,
                    orgId: orgId, // Forceer de orgId uit de sessie
                })
                .returning();
            return result[0];
        } catch (error) {
            console.error('Analytic Account Create Error:', error);
            throw new BadRequestException('Kon kostenplaats niet aanmaken. Mogelijk bestaat de code al.');
        }
    }

    async update(id: string, orgId: string, dto: UpdateAnalyticAccountDto) {
        const { orgId: _, ...updateData } = dto;

        const result = await this.db
            .update(analyticAccounts)
            .set(updateData)
            .where(
                and(
                    eq(analyticAccounts.id, id), 
                    eq(analyticAccounts.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Kostenplaats niet gevonden of geen wijzigingsrechten`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db
            .delete(analyticAccounts)
            .where(
                and(
                    eq(analyticAccounts.id, id), 
                    eq(analyticAccounts.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Kostenplaats niet gevonden of geen verwijderrechten`);
        }
        return result[0];
    }
}