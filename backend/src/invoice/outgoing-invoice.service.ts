// backend/src/accounting/outgoing-invoice.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { outgoingInvoices } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateOutgoingInvoiceDto, UpdateOutgoingInvoiceDto } from './outgoing-invoice.dto';

@Injectable()
export class OutgoingInvoiceService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select()
            .from(outgoingInvoices)
            .where(eq(outgoingInvoices.orgId, orgId));
    }

    async findOne(id: string) {
        const result = await this.db.select()
            .from(outgoingInvoices)
            .where(eq(outgoingInvoices.id, id));

        if (!result.length) {
            throw new NotFoundException(`Verkoopfactuur met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateOutgoingInvoiceDto) {
        const result = await this.db.insert(outgoingInvoices)
            .values({
                orgId: dto.orgId,
                customerId: dto.customerId,
                invoiceNr: dto.invoiceNr,
                date: dto.date, 
                dueDate: dto.dueDate,
                vatCodeId: dto.vatCodeId,
                peppolStatus: dto.peppolStatus || 'DRAFT',
            })
            .returning();
        return result[0];
    }

    async update(id: string, dto: UpdateOutgoingInvoiceDto) {
        const result = await this.db.update(outgoingInvoices)
            .set(dto)
            .where(eq(outgoingInvoices.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Verkoopfactuur met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async delete(id: string) {
        const result = await this.db.delete(outgoingInvoices)
            .where(eq(outgoingInvoices.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Verkoopfactuur met ID ${id} niet gevonden`);
        }
        return result[0];
    }
}