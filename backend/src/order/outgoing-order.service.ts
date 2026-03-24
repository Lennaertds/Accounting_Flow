// backend/src/accounting/outgoing-order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { outgoingOrders } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateOutgoingOrderDto, UpdateOutgoingOrderStatusDto } from './outgoing-order.dto';

@Injectable()
export class OutgoingOrderService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select()
            .from(outgoingOrders)
            .where(eq(outgoingOrders.orgId, orgId));
    }

    async findOne(id: string) {
        const result = await this.db.select()
            .from(outgoingOrders)
            .where(eq(outgoingOrders.id, id));

        if (!result.length) {
            throw new NotFoundException(`Uitgaande order met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateOutgoingOrderDto) {
        const result = await this.db.insert(outgoingOrders)
            .values({
                orgId: dto.orgId,
                supplierId: dto.supplierId,
                channel: dto.channel,
                status: dto.status || 'ORDERED',
            })
            .returning();
        return result[0];
    }

    async updateStatus(id: string, dto: UpdateOutgoingOrderStatusDto) {
        const result = await this.db.update(outgoingOrders)
            .set({ status: dto.status })
            .where(eq(outgoingOrders.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Uitgaande order met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async delete(id: string) {
        const result = await this.db.delete(outgoingOrders)
            .where(eq(outgoingOrders.id, id))
            .returning();
            
        if (!result.length) throw new NotFoundException('Order niet gevonden');
        return result[0];
    }
}