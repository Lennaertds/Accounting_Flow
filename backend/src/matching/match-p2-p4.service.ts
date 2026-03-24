// backend/src/accounting/match-p2-p4.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { matchP2P4, outgoingInvoices } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateMatchP2P4Dto } from './match-p2-p4.dto';

@Injectable()
export class MatchP2P4Service {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async create(dto: CreateMatchP2P4Dto) {
        return await this.db.transaction(async (tx) => {
            const [match] = await tx.insert(matchP2P4)
                .values({
                    incomingOrderId: dto.incomingOrderId,
                    outgoingInvoiceId: dto.outgoingInvoiceId,
                })
                .returning();

            await tx.update(outgoingInvoices)
                .set({ peppolStatus: 'SENT' })
                .where(eq(outgoingInvoices.id, dto.outgoingInvoiceId));

            return match;
        });
    }

    async findByInvoice(invoiceId: string) {
        return await this.db.select()
            .from(matchP2P4)
            .where(eq(matchP2P4.outgoingInvoiceId, invoiceId));
    }

    async findByOrder(orderId: string) {
        return await this.db.select()
            .from(matchP2P4)
            .where(eq(matchP2P4.incomingOrderId, orderId));
    }
}