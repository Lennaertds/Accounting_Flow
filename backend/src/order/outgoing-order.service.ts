// backend/src/accounting/outgoing-order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { outgoingOrders } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateOutgoingOrderDto, UpdateOutgoingOrderDto } from './outgoing-order.dto';

@Injectable()
export class OutgoingOrderService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select()
            .from(outgoingOrders)
            .where(eq(outgoingOrders.orgId, orgId));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db.select()
            .from(outgoingOrders)
            .where(
                and(
                    eq(outgoingOrders.id, id), 
                    eq(outgoingOrders.orgId, orgId)
                )
            );

        if (!result.length) {
            throw new NotFoundException(`Uitgaande order niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateOutgoingOrderDto, orgId: string) {
        const result = await this.db.insert(outgoingOrders)
            .values({
                orgId: orgId,
                supplierId: dto.supplierId,
                orderNr: dto.orderNr,
                channel: dto.channel,
                status: dto.status || 'ORDERED',
            })
            .returning();
        return result[0];
    }

    async updateStatus(id: string, orgId: string, dto: UpdateOutgoingOrderDto) {
        const result = await this.db.update(outgoingOrders)
            .set({ status: dto.status })
            .where(
                and(
                    eq(outgoingOrders.id, id), 
                    eq(outgoingOrders.orgId, orgId)
                )
            )
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Uitgaande order niet gevonden`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db.delete(outgoingOrders)
            .where(
                and(
                    eq(outgoingOrders.id, id), 
                    eq(outgoingOrders.orgId, orgId)
                )
            )
            .returning();
            
        if (!result.length) throw new NotFoundException('Order niet gevonden');
        return result[0];
    }
}