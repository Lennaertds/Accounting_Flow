// backend/src/accounting/incoming-invoice.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { 
    IsString, 
    IsNotEmpty, 
    IsUUID, 
    IsDateString, 
    IsNumber, 
    IsOptional, 
    IsBoolean,
    Min
} from 'class-validator';

export class CreateIncomingInvoiceDto {
    @ApiProperty({ example: 'uuid-van-organisatie', description: 'De eigenaar van deze factuur' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string; 

    @ApiProperty({ example: 'uuid-van-partner', description: 'De leverancier die de factuur stuurde' })
    @IsUUID()
    @IsNotEmpty()
    supplierId!: string; 

    @ApiProperty({ example: 'INV-2026-001', description: 'Het factuurnummer van de leverancier' })
    @IsString()
    @IsNotEmpty()
    invoiceNr!: string; 

    @ApiProperty({ example: '2026-03-24', description: 'Factuurdatum' })
    @IsDateString()
    @IsNotEmpty()
    date!: string;

    @ApiProperty({ example: '2026-04-24', required: false, description: 'Vervaldatum van de betaling' })
    @IsDateString()
    @IsOptional() 
    dueDate?: string;

    @ApiProperty({ example: 1000.00, description: 'Bedrag exclusief BTW' })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    totalExclVat!: number; 

    @ApiProperty({ example: 'BTW21', description: 'De code van de BTW-regel (PK van vat_codes)' })
    @IsString()
    @IsNotEmpty()
    vatCodeId!: string; 

    @ApiProperty({ example: 'PENDING', default: 'PENDING', description: 'Status in het workflow proces' })
    @IsString()
    @IsOptional() 
    status?: string;

    @ApiProperty({ example: false, default: false, description: 'Is deze factuur binnengekomen via het PEPPOL netwerk?' })
    @IsBoolean()
    @IsOptional()
    isPeppol?: boolean;

    @ApiProperty({ example: 0.98, required: false, description: 'Betrouwbaarheidsscore van de OCR scan (0-1)' })
    @IsNumber()
    @IsOptional()
    ocrConfidence?: number;

    @ApiProperty({ example: '/storage/invoices/inv_001.pdf', required: false, description: 'Pad naar het fysieke bestand' })
    @IsString()
    @IsOptional()
    rawFileStoragePath?: string;
}

export class UpdateIncomingInvoiceDto extends PartialType(CreateIncomingInvoiceDto) {}