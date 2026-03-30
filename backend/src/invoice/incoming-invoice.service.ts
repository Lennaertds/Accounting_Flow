// backend/src/accounting/incoming-invoice.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { incomingInvoices } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateIncomingInvoiceDto, UpdateIncomingInvoiceDto } from './incoming-invoice.dto';

@Injectable()
export class IncomingInvoiceService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db
            .select()
            .from(incomingInvoices)
            .where(eq(incomingInvoices.orgId, orgId));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db
            .select()
            .from(incomingInvoices)
            .where(
                and(
                    eq(incomingInvoices.id, id),
                    eq(incomingInvoices.orgId, orgId)
                )
            );

        if (!result.length) {
            throw new NotFoundException(`Inkoopfactuur met ID ${id} niet gevonden.`);
        }
        return result[0];
    }

    async create(dto: CreateIncomingInvoiceDto, orgId: string) {
        const insertValues = {
            orgId: orgId,
            supplierId: dto.supplierId,
            invoiceNr: dto.invoiceNr,
            date: dto.date, // Verwacht string "YYYY-MM-DD"
            dueDate: dto.dueDate ?? null,
            totalExclVat: dto.totalExclVat.toString(),
            vatCodeId: dto.vatCodeId,
            status: dto.status ?? 'PENDING',
            isPeppol: dto.isPeppol ?? false,
            ocrConfidence: dto.ocrConfidence ? dto.ocrConfidence.toString() : null,
            rawFileStoragePath: dto.rawFileStoragePath ?? null,
        };

        try {
            const result = await this.db.insert(incomingInvoices)
                .values(insertValues)
                .returning();
            return result[0];
        } catch (error) {
            console.error('Database Error bij aanmaken inkoopfactuur:', error);
            throw error;
        }
    }

    async update(id: string, orgId: string, dto: UpdateIncomingInvoiceDto) {
        const { orgId: _, ...updateData } = dto;

        const finalUpdateData: any = { ...updateData };
        if (dto.totalExclVat !== undefined) {
            finalUpdateData.totalExclVat = dto.totalExclVat.toString();
        }

        const result = await this.db
            .update(incomingInvoices)
            .set(finalUpdateData)
            .where(
                and(
                    eq(incomingInvoices.id, id),
                    eq(incomingInvoices.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Inkoopfactuur niet gevonden of geen wijzigingsrechten.`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db
            .delete(incomingInvoices)
            .where(
                and(
                    eq(incomingInvoices.id, id),
                    eq(incomingInvoices.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Inkoopfactuur niet gevonden of geen verwijderrechten.`);
        }
        return result[0];
    }
}