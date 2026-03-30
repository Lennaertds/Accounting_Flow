// backend/src/accounting/outgoing-invoice.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { outgoingInvoices } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateOutgoingInvoiceDto, UpdateOutgoingInvoiceDto, PeppolStatus } from './outgoing-invoice.dto';

@Injectable()
export class OutgoingInvoiceService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db
            .select()
            .from(outgoingInvoices)
            .where(eq(outgoingInvoices.orgId, orgId));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db
            .select()
            .from(outgoingInvoices)
            .where(
                and(
                    eq(outgoingInvoices.id, id),
                    eq(outgoingInvoices.orgId, orgId)
                )
            );

        if (!result.length) {
            throw new NotFoundException(`Verkoopfactuur met ID ${id} niet gevonden binnen uw organisatie.`);
        }
        return result[0];
    }

    async create(dto: CreateOutgoingInvoiceDto, orgId: string) {
        const insertValues = {
            orgId: orgId, // Forceer orgId uit de sessie
            customerId: dto.customerId,
            invoiceNr: dto.invoiceNr,
            date: dto.date, // String YYYY-MM-DD
            dueDate: dto.dueDate ?? null,
            totalExclVat: dto.totalExclVat.toString(), // Belangrijk: Decimal moet string zijn
            vatCodeId: dto.vatCodeId,
            peppolStatus: dto.peppolStatus ?? PeppolStatus.DRAFT,
            rawFileStoragePath: dto.rawFileStoragePath ?? null,
        };

        try {
            const result = await this.db.insert(outgoingInvoices)
                .values(insertValues)
                .returning();
            return result[0];
        } catch (error) {
            console.error('Database Error bij aanmaken verkoopfactuur:', error);
            throw error;
        }
    }

    async update(id: string, orgId: string, dto: UpdateOutgoingInvoiceDto) {
        const { orgId: _, ...updateData } = dto;

        const finalUpdateData: any = { ...updateData };
        
        if (dto.totalExclVat !== undefined) {
            finalUpdateData.totalExclVat = dto.totalExclVat.toString();
        }

        const result = await this.db
            .update(outgoingInvoices)
            .set(finalUpdateData)
            .where(
                and(
                    eq(outgoingInvoices.id, id),
                    eq(outgoingInvoices.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Verkoopfactuur niet gevonden of geen wijzigingsrechten.`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db
            .delete(outgoingInvoices)
            .where(
                and(
                    eq(outgoingInvoices.id, id),
                    eq(outgoingInvoices.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Verkoopfactuur niet gevonden of geen verwijderrechten.`);
        }
        return result[0];
    }
}