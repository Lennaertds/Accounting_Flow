// backend/src/accounting/outgoing-invoice.module.ts
import { Module } from '@nestjs/common';
import { OutgoingInvoiceController } from './outgoing-invoice.controller';
import { OutgoingInvoiceService } from './outgoing-invoice.service';

@Module({
    controllers: [OutgoingInvoiceController],
    providers: [OutgoingInvoiceService],
    exports: [OutgoingInvoiceService],
})
export class OutgoingInvoiceModule {}