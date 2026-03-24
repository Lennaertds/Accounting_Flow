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

    @ApiProperty({ example: '2026-03-24', description: 'Factuurdatum' })
    @IsDateString()
    @IsNotEmpty()
    date!: string; // Toegevoegd

    @ApiProperty({ example: '2026-04-24', description: 'Vervaldatum' })
    @IsDateString()
    @IsNotEmpty()
    dueDate!: string;

    @ApiProperty({ example: 'BTW21' })
    @IsString()
    @IsNotEmpty()
    vatCodeId!: string;

    @ApiProperty({ example: 'DRAFT' })
    @IsString()
    @IsOptional()
    peppolStatus?: string;
}

export class UpdateOutgoingInvoiceDto {
    @ApiProperty({ enum: PeppolStatus, required: false })
    @IsEnum(PeppolStatus)
    @IsOptional()
    peppolStatus?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    dueDate?: string;
}