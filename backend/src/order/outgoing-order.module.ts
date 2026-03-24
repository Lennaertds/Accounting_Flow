// backend/src/accounting/outgoing-order.module.ts
import { Module } from '@nestjs/common';
import { OutgoingOrderController } from './outgoing-order.controller';
import { OutgoingOrderService } from './outgoing-order.service';

@Module({
    controllers: [OutgoingOrderController],
    providers: [OutgoingOrderService],
    exports: [OutgoingOrderService],
})
export class OutgoingOrderModule {}