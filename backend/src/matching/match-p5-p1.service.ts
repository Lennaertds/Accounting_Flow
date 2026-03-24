// backend/src/accounting/match-p5-p1.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { matchP5P1, incomingInvoices, outgoingOrders } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateMatchP5P1Dto } from './match-p5-p1.dto';

@Injectable()
export class MatchP5P1Service {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async create(dto: CreateMatchP5P1Dto) {
        return await this.db.transaction(async (tx) => {
            const [match] = await tx.insert(matchP5P1)
                .values({
                    outgoingOrderId: dto.outgoingOrderId,
                    incomingInvoiceId: dto.incomingInvoiceId,
                })
                .returning();

            await tx.update(incomingInvoices)
                .set({ status: 'MATCHED' })
                .where(eq(incomingInvoices.id, dto.incomingInvoiceId));

            await tx.update(outgoingOrders)
                .set({ status: 'INVOICED' })
                .where(eq(outgoingOrders.id, dto.outgoingOrderId));

            return match;
        });
    }

    async findByInvoice(invoiceId: string) {
        return await this.db.select()
            .from(matchP5P1)
            .where(eq(matchP5P1.incomingInvoiceId, invoiceId));
    }

    async findByOrder(orderId: string) {
        return await this.db.select()
            .from(matchP5P1)
            .where(eq(matchP5P1.outgoingOrderId, orderId));
    }
}