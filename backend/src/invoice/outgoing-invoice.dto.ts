// backend/src/accounting/outgoing-invoice.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { 
    IsString, 
    IsNotEmpty, 
    IsUUID, 
    IsDateString, 
    IsOptional, 
    IsEnum, 
    IsNumber, 
    Min 
} from 'class-validator';

export enum PeppolStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE'
}

export class CreateOutgoingInvoiceDto {
    @ApiProperty({ example: 'uuid-van-organisatie', description: 'De verkopende organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ example: 'uuid-van-klant', description: 'De klant (Partner) die de factuur ontvangt' })
    @IsUUID()
    @IsNotEmpty()
    customerId!: string;

    @ApiProperty({ example: 'FACT-2026-001', description: 'Uniek verkoopfactuurnummer' })
    @IsString()
    @IsNotEmpty()
    invoiceNr!: string;

    @ApiProperty({ example: '2026-03-24', description: 'Factuurdatum' })
    @IsDateString()
    @IsNotEmpty()
    date!: string;

    @ApiProperty({ example: '2026-04-24', required: false, description: 'Uiterste betaaldatum' })
    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @ApiProperty({ example: 2500.00, description: 'Totaalbedrag exclusief BTW' })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    totalExclVat!: number;

    @ApiProperty({ example: 'BTW21', description: 'De BTW-code ID' })
    @IsString()
    @IsNotEmpty()
    vatCodeId!: string;

    @ApiProperty({ enum: PeppolStatus, example: 'DRAFT', default: 'DRAFT', description: 'Status in het verzendproces' })
    @IsEnum(PeppolStatus)
    @IsOptional()
    peppolStatus?: PeppolStatus;

    @ApiProperty({ example: '/storage/outvoices/fact_001.pdf', required: false, description: 'Pad naar de gegenereerde PDF' })
    @IsString()
    @IsOptional()
    rawFileStoragePath?: string;
}

export class UpdateOutgoingInvoiceDto extends PartialType(CreateOutgoingInvoiceDto) {}