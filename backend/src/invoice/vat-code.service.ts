// backend/src/accounting/vat-code.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { vatCodes } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateVatCodeDto, UpdateVatCodeDto } from './vat-code.dto';

@Injectable()
export class VatCodeService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select()
            .from(vatCodes)
            .where(eq(vatCodes.orgId, orgId));
    }

    async findOne(code: string, orgId: string) {
        const result = await this.db.select()
            .from(vatCodes)
            .where(and(eq(vatCodes.code, code), eq(vatCodes.orgId, orgId)));
            
        if (!result.length) {
            throw new NotFoundException(`BTW-code ${code} niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateVatCodeDto) {
        const result = await this.db.insert(vatCodes)
            .values({
                ...dto,
                rate: dto.rate.toString(),
            })
            .returning();
        return result[0];
    }

    async update(code: string, orgId: string, dto: UpdateVatCodeDto) {
        const updateData: any = { ...dto };
        if (dto.rate) updateData.rate = dto.rate.toString();

        const result = await this.db.update(vatCodes)
            .set(updateData)
            .where(and(eq(vatCodes.code, code), eq(vatCodes.orgId, orgId)))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`BTW-code ${code} niet gevonden om bij te werken`);
        }
        return result[0];
    }

    async delete(code: string, orgId: string) {
        const result = await this.db.delete(vatCodes)
            .where(and(eq(vatCodes.code, code), eq(vatCodes.orgId, orgId)))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`BTW-code ${code} niet gevonden om te verwijderen`);
        }
        return result[0];
    }
}