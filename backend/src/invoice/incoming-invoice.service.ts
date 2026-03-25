// backend/src/accounting/incoming-invoice.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { incomingInvoices } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateIncomingInvoiceDto, UpdateIncomingInvoiceDto } from './incoming-invoice.dto';

@Injectable()
export class IncomingInvoiceService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select().from(incomingInvoices).where(eq(incomingInvoices.orgId, orgId));
    }

    async findOne(id: string) {
        const result = await this.db
            .select()
            .from(incomingInvoices)
            .where(eq(incomingInvoices.id, id));
        
        if (!result.length) {
            throw new NotFoundException(`Inkoopfactuur met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateIncomingInvoiceDto) {
        const result = await this.db.insert(incomingInvoices)
            .values({
                orgId: dto.orgId,
                supplierId: dto.supplierId,
                invoiceNr: dto.invoiceNr,
                date: dto.date,
                dueDate: dto.dueDate,
                totalExclVat: dto.totalExclVat.toString(),
                vatCodeId: dto.vatCodeId,
                status: dto.status || 'PENDING',
            })
            .returning();
        return result[0];
    }

    async update(id: string, dto: UpdateIncomingInvoiceDto) {
        const updateData: any = { ...dto };
        if (dto.totalExclVat) updateData.totalExclVat = dto.totalExclVat.toString();

        const result = await this.db.update(incomingInvoices)
            .set(updateData)
            .where(eq(incomingInvoices.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Inkoopfactuur met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async delete(id: string) {
        const result = await this.db.delete(incomingInvoices).where(eq(incomingInvoices.id, id)).returning();
        if (!result.length) throw new NotFoundException('Inkoopfactuur niet gevonden');
        return result[0];
    }
}