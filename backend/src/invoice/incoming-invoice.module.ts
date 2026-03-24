// backend/src/accounting/incoming-invoice.module.ts
import { Module } from '@nestjs/common';
import { IncomingInvoiceController } from './incoming-invoice.controller';
import { IncomingInvoiceService } from './incoming-invoice.service';

@Module({
    controllers: [IncomingInvoiceController],
    providers: [IncomingInvoiceService],
    exports: [IncomingInvoiceService],
})
export class IncomingInvoiceModule {}