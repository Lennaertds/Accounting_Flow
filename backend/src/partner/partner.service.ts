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
        return await this.db.select()
            .from(partners)
            .where(eq(partners.orgId, orgId));
    }

    async findOne(id: string) {
        const result = await this.db.select()
            .from(partners)
            .where(eq(partners.id, id));

        if (!result.length) {
            throw new NotFoundException(`Partner met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreatePartnerDto) {
        const result = await this.db.insert(partners)
            .values(dto)
            .returning();
        return result[0];
    }

    async update(id: string, dto: UpdatePartnerDto) {
        const result = await this.db.update(partners)
            .set(dto)
            .where(eq(partners.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Partner met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async delete(id: string) {
        const result = await this.db.delete(partners)
            .where(eq(partners.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Partner niet gevonden`);
        }
        return result[0];
    }
}