// backend/src/accounting/outgoing-order.module.ts
import { Module } from '@nestjs/common';
import { OutgoingOrderController } from './outgoing-order.controller';
import { OutgoingOrderService } from './outgoing-order.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [OutgoingOrderController],
    providers: [OutgoingOrderService],
    exports: [OutgoingOrderService],
})
export class OutgoingOrderModule {}