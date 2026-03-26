// backend/src/accounting/partner.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { partners } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreatePartnerDto, UpdatePartnerDto } from './partner.dto';

@Injectable()
export class PartnerService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db
            .select()
            .from(partners)
            .where(eq(partners.orgId, orgId));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db
            .select()
            .from(partners)
            .where(
                and(
                    eq(partners.id, id), 
                    eq(partners.orgId, orgId)
                )
            );

        if (!result.length) {
            throw new NotFoundException(`Partner met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreatePartnerDto, orgId: string) {
        const insertValues = {
            ...dto,
            orgId: orgId
        };
        
        try {
            const result = await this.db.insert(partners)
                .values(insertValues)
                .returning();
            return result[0];
        } catch (error) {
            console.error('6. Database Error detail:', error);
            throw error;
        }
    }

    async update(id: string, orgId: string, dto: UpdatePartnerDto) {
        const { orgId: _, ...updateData } = dto;

        const result = await this.db
            .update(partners)
            .set(updateData)
            .where(
                and(
                    eq(partners.id, id), 
                    eq(partners.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Partner niet gevonden of geen wijzigingsrechten`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db
            .delete(partners)
            .where(
                and(
                    eq(partners.id, id), 
                    eq(partners.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Partner niet gevonden of geen verwijderrechten`);
        }
        return result[0];
    }
}