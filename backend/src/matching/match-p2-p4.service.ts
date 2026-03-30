// backend/src/accounting/match-p2-p4.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { matchP2P4, outgoingInvoices, incomingOrders } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateMatchP2P4Dto } from './match-p2-p4.dto';

@Injectable()
export class MatchP2P4Service {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async create(dto: CreateMatchP2P4Dto, orgId: string) {
        return await this.db.transaction(async (tx) => {
            const [invoice] = await tx.select()
                .from(outgoingInvoices)
                .where(and(eq(outgoingInvoices.id, dto.outgoingInvoiceId), eq(outgoingInvoices.orgId, orgId)));

            if (!invoice) {
                throw new NotFoundException('Factuur niet gevonden of geen toegang.');
            }

            const [match] = await tx.insert(matchP2P4)
                .values({
                    orgId: orgId,
                    incomingOrderId: dto.incomingOrderId,
                    outgoingInvoiceId: dto.outgoingInvoiceId,
                    matchConfidence: dto.matchConfidence ? dto.matchConfidence.toString() : null,
                })
                .returning();

            await tx.update(outgoingInvoices)
                .set({ peppolStatus: 'SENT' })
                .where(and(eq(outgoingInvoices.id, dto.outgoingInvoiceId), eq(outgoingInvoices.orgId, orgId)));

            return match;
        });
    }

    async findByInvoice(invoiceId: string, orgId: string) {
        return await this.db.select()
            .from(matchP2P4)
            .where(and(
                eq(matchP2P4.outgoingInvoiceId, invoiceId),
                eq(matchP2P4.orgId, orgId)
            ));
    }

    async findByOrder(orderId: string, orgId: string) {
        return await this.db.select()
            .from(matchP2P4)
            .where(and(
                eq(matchP2P4.incomingOrderId, orderId),
                eq(matchP2P4.orgId, orgId)
            ));
    }
}