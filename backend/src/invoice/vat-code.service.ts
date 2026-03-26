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

    async findById(id: string, orgId: string) {
        const result = await this.db.select()
            .from(vatCodes)
            .where(
                and(
                    eq(vatCodes.id, id), 
                    eq(vatCodes.orgId, orgId)
                )
            );
            
        if (!result.length) {
            throw new NotFoundException(`BTW-instelling met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async findOneByCode(code: string, orgId: string) {
        const result = await this.db.select()
            .from(vatCodes)
            .where(
                and(
                    eq(vatCodes.code, code), 
                    eq(vatCodes.orgId, orgId)
                )
            );
            
        if (!result.length) {
            throw new NotFoundException(`BTW-code ${code} niet gevonden voor deze organisatie`);
        }
        return result[0];
    }

    async create(dto: CreateVatCodeDto, orgId: string) {
        const result = await this.db.insert(vatCodes)
            .values({
                ...dto,
                orgId: orgId,
                rate: dto.rate.toString(),
            })
            .returning();
        return result[0];
    }

    async update(id: string, orgId: string, dto: UpdateVatCodeDto) {
        const finalUpdate: any = { ...dto };
        
        if (dto.rate != undefined) {
            finalUpdate.rate = dto.rate.toString();
        }

        const result = await this.db.update(vatCodes)
            .set(finalUpdate)
            .where(
                and(
                    eq(vatCodes.id, id), 
                    eq(vatCodes.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`BTW-code niet gevonden of geen wijzigingsrechten`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db.delete(vatCodes)
            .where(
                and(
                    eq(vatCodes.id, id), 
                    eq(vatCodes.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`BTW-code niet gevonden of geen verwijderrechten`);
        }
        return result[0];
    }
}