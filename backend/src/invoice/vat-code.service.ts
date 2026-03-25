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

    async findById(id: string) {
        const result = await this.db.select()
            .from(vatCodes)
            .where(eq(vatCodes.id, id));
            
        if (!result.length) {
            throw new NotFoundException(`BTW-instelling met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    // Zoeken op code + orgId (Handig voor de Seed en Inports)
    async findOneByCode(code: string, orgId: string) {
        const result = await this.db.select()
            .from(vatCodes)
            .where(and(eq(vatCodes.code, code), eq(vatCodes.orgId, orgId)));
            
        if (!result.length) {
            throw new NotFoundException(`BTW-code ${code} niet gevonden voor deze organisatie`);
        }
        return result[0];
    }

    async create(dto: CreateVatCodeDto) {
        const result = await this.db.insert(vatCodes)
            .values({
                orgId: dto.orgId,
                code: dto.code,
                rate: dto.rate.toString(),
                description: dto.description,
                taxDeclarationBox: dto.taxDeclarationBox ?? 0,
            })
            .returning();
        return result[0];
    }

    async update(id: string, dto: UpdateVatCodeDto) {
        const updateData: any = { ...dto };
        if (dto.rate) updateData.rate = dto.rate.toString();

        const result = await this.db.update(vatCodes)
            .set(updateData)
            .where(eq(vatCodes.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`BTW-code niet gevonden om bij te werken`);
        }
        return result[0];
    }

    async delete(id: string) {
        const result = await this.db.delete(vatCodes)
            .where(eq(vatCodes.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`BTW-code niet gevonden om te verwijderen`);
        }
        return result[0];
    }
}