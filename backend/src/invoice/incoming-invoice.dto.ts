// backend/src/accounting/incoming-invoice.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateIncomingInvoiceDto {
    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string; 

    @ApiProperty({ example: 'uuid-van-partner' })
    @IsUUID()
    @IsNotEmpty()
    supplierId!: string; 

    @ApiProperty({ example: 'INV-2026-001' })
    @IsString()
    @IsNotEmpty()
    invoiceNr!: string; 

    @ApiProperty({ example: '2026-03-24' })
    @IsDateString()
    @IsNotEmpty()
    date!: string;

    @ApiProperty({ example: '2026-04-24', required: false })
    @IsDateString()
    @IsOptional() 
    dueDate?: string;

    @ApiProperty({ example: 1000.00 })
    @IsNumber()
    @IsNotEmpty()
    totalExclVat!: number; 

    @ApiProperty({ example: 'BTW21', description: 'De code van de BTW-regel (PK van vat_codes)' })
    @IsString()
    @IsNotEmpty()
    vatCodeId!: string; 

    @ApiProperty({ example: 'PENDING', default: 'PENDING' })
    @IsString()
    @IsOptional() 
    status?: string;

    @ApiProperty({ example: false, default: false })
    @IsBoolean()
    @IsOptional()
    isPeppol?: boolean;

    @ApiProperty({ example: 0.98, required: false })
    @IsNumber()
    @IsOptional()
    ocrConfidence?: number;

    @ApiProperty({ example: '/storage/invoices/inv_001.pdf', required: false })
    @IsString()
    @IsOptional()
    rawFileStoragePath?: string;
}

export class UpdateIncomingInvoiceDto {
    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    totalExclVat?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    status?: string;
}