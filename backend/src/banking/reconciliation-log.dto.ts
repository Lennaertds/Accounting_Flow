// backend/src/accounting/reconciliation-log.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReconciliationLogDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    transactionId!: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    bankStatementId!: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    journalEntryId?: string;

    @ApiProperty({ example: 'MANUAL', default: 'MANUAL' })
    @IsString()
    @IsOptional()
    matchType?: string;

    @ApiProperty({ example: '2026-03-24' })
    @IsDateString()
    @IsNotEmpty()
    reconciledAt!: string;
}