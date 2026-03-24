// backend/src/accounting/vat-code.module.ts
import { Module } from '@nestjs/common';
import { VatCodeController } from './vat-code.controller';
import { VatCodeService } from './vat-code.service';

@Module({
    controllers: [VatCodeController],
    providers: [VatCodeService],
    exports: [VatCodeService],
})
export class VatCodeModule {}