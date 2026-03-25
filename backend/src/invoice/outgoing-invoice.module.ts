// backend/src/accounting/outgoing-invoice.module.ts
import { Module } from '@nestjs/common';
import { OutgoingInvoiceController } from './outgoing-invoice.controller';
import { OutgoingInvoiceService } from './outgoing-invoice.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [OutgoingInvoiceController],
    providers: [OutgoingInvoiceService],
    exports: [OutgoingInvoiceService],
})
export class OutgoingInvoiceModule {}