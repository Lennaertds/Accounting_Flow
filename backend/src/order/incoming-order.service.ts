// backend/src/accounting/incoming-order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { incomingOrders } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateIncomingOrderDto, UpdateIncomingOrderDto } from './incoming-order.dto';

@Injectable()
export class IncomingOrderService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll(orgId: string) {
        return await this.db.select()
            .from(incomingOrders)
            .where(eq(incomingOrders.orgId, orgId));
    }

    async findOne(id: string) {
        const result = await this.db.select()
            .from(incomingOrders)
            .where(eq(incomingOrders.id, id));

        if (!result.length) {
            throw new NotFoundException(`Inkomende order met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async create(dto: CreateIncomingOrderDto) {
        const result = await this.db.insert(incomingOrders)
            .values({
                ...dto,
                totalEstimated: dto.totalEstimated?.toString(), // Decimal fix
            })
            .returning();
        return result[0];
    }

    async update(id: string, dto: UpdateIncomingOrderDto) {
        const updateData: any = { ...dto };
        if (dto.totalEstimated) updateData.totalEstimated = dto.totalEstimated.toString();

        const result = await this.db.update(incomingOrders)
            .set(updateData)
            .where(eq(incomingOrders.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException(`Inkomende order met ID ${id} niet gevonden`);
        }
        return result[0];
    }

    async delete(id: string) {
        const result = await this.db.delete(incomingOrders)
            .where(eq(incomingOrders.id, id))
            .returning();
            
        if (!result.length) throw new NotFoundException('Order niet gevonden');
        return result[0];
    }
}