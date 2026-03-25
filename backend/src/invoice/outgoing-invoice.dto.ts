// backend/src/accounting/outgoing-invoice.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional, IsEnum } from 'class-validator';

export enum PeppolStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PAID = 'PAID'
}

export class CreateOutgoingInvoiceDto {
    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ example: 'uuid-van-klant' })
    @IsUUID()
    @IsNotEmpty()
    customerId!: string;

    @ApiProperty({ example: 'FACT-2026-001' })
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

    @ApiProperty({ example: 'BTW21' })
    @IsString()
    @IsNotEmpty()
    vatCodeId!: string;

    @ApiProperty({ enum: PeppolStatus, example: 'DRAFT', default: 'DRAFT' })
    @IsEnum(PeppolStatus)
    @IsOptional()
    peppolStatus?: PeppolStatus;

    @ApiProperty({ example: '/storage/outvoices/fact_001.pdf', required: false })
    @IsString()
    @IsOptional()
    rawFileStoragePath?: string;
}

export class UpdateOutgoingInvoiceDto {
    @ApiProperty({ enum: PeppolStatus, required: false })
    @IsEnum(PeppolStatus)
    @IsOptional()
    peppolStatus?: PeppolStatus;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    dueDate?: string;
}