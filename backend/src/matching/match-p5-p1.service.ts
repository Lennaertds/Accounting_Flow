// backend/src/accounting/match-p5-p1.service.ts
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { DatabaseProvider } from '../drizzle/drizzle.provider';
import * as schema from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateMatchP5P1Dto } from './match-p5-p1.dto';

@Injectable()
export class MatchP5P1Service {
    constructor(
        @Inject(DrizzleAsyncProvider) private db: DatabaseProvider
    ) {}

    async create(dto: CreateMatchP5P1Dto) {
        // 1. Haal de order op om de orgId te verifiëren
        const [order] = await this.db.select()
            .from(schema.outgoingOrders)
            .where(eq(schema.outgoingOrders.id, dto.outgoingOrderId))
            .limit(1);

        if (!order) throw new NotFoundException('Outgoing order niet gevonden');

        // 2. Haal de factuur op
        const [invoice] = await this.db.select()
            .from(schema.incomingInvoices)
            .where(eq(schema.incomingInvoices.id, dto.incomingInvoiceId))
            .limit(1);

        if (!invoice) throw new NotFoundException('Incoming invoice niet gevonden');

        // 3. Security Check: Horen ze bij dezelfde organisatie?
        if (order.orgId !== invoice.orgId) {
            throw new BadRequestException('Documenten behoren tot verschillende organisaties');
        }

        // 4. Voer de match uit binnen een transactie
        return await this.db.transaction(async (tx) => {
            // Voeg de match toe (INCLUSIEF orgId)
            const [newMatch] = await tx.insert(schema.matchP5P1).values({
                orgId: order.orgId, // <--- Dit lost je error op
                outgoingOrderId: dto.outgoingOrderId,
                incomingInvoiceId: dto.incomingInvoiceId,
                matchConfidence: dto.matchConfidence?.toString() // Decimal verwacht een string
            }).returning();

            // Update de status van de inkomende factuur naar MATCHED
            await tx.update(schema.incomingInvoices)
                .set({ status: 'MATCHED' })
                .where(eq(schema.incomingInvoices.id, dto.incomingInvoiceId));

            return newMatch;
        });
    }

    async findByInvoice(invoiceId: string) {
        return this.db.select()
            .from(schema.matchP5P1)
            .where(eq(schema.matchP5P1.incomingInvoiceId, invoiceId));
    }

    async findByOrder(orderId: string) {
        return this.db.select()
            .from(schema.matchP5P1)
            .where(eq(schema.matchP5P1.outgoingOrderId, orderId));
    }
}