// backend/src/accounting/incoming-order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { incomingOrders } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateIncomingOrderDto, UpdateIncomingOrderDto, IncomingOrderStatus } from './incoming-order.dto';

@Injectable()
export class IncomingOrderService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select()
            .from(incomingOrders)
            .where(eq(incomingOrders.orgId, orgId));
    }

    async findOne(id: string, orgId: string) {
        const result = await this.db.select()
            .from(incomingOrders)
            .where(and(eq(incomingOrders.id, id), eq(incomingOrders.orgId, orgId)));

        if (!result.length) {
            throw new NotFoundException(`Inkomende order niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateIncomingOrderDto, orgId: string) {
        const result = await this.db.insert(incomingOrders)
            .values({
                orgId: orgId, 
                customerId: dto.customerId,
                date: dto.date,
                source: dto.source,
                referenceExt: dto.referenceExt,
                totalEstimated: dto.totalEstimated.toString(),
                status: dto.status || IncomingOrderStatus.RECEIVED,
                aiSummary: dto.aiSummary,
            })
            .returning();
        return result[0];
    }

    async update(id: string, orgId: string, dto: UpdateIncomingOrderDto) {
        const { ...updateData }: any = dto;
        
        if (dto.totalEstimated) updateData.totalEstimated = dto.totalEstimated.toString();
        
        const result = await this.db.update(incomingOrders)
            .set(updateData)
            .where(and(eq(incomingOrders.id, id), eq(incomingOrders.orgId, orgId)))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Inkomende order niet gevonden`);
        }
        return result[0];
    }

    async delete(id: string, orgId: string) {
        const result = await this.db.delete(incomingOrders)
            .where(and(eq(incomingOrders.id, id), eq(incomingOrders.orgId, orgId)))
            .returning();
            
        if (!result.length) throw new NotFoundException('Order niet gevonden');
        return result[0];
    }
}