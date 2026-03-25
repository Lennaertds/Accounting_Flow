// backend/src/accounting/incoming-order.module.ts
import { Module } from '@nestjs/common';
import { IncomingOrderController } from './incoming-order.controller';
import { IncomingOrderService } from './incoming-order.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [IncomingOrderController],
    providers: [IncomingOrderService],
    exports: [IncomingOrderService],
})
export class IncomingOrderModule {}