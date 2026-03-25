// backend/src/accounting/reconciliation-log.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export enum MatchType {
    AUTO = 'AUTO',
    MANUAL = 'MANUAL'
}

export class CreateReconciliationLogDto {
    @ApiProperty({ example: 'uuid-bank-statement' })
    @IsUUID()
    @IsNotEmpty()
    bankStatementId!: string;

    @ApiProperty({ example: 'uuid-journal-entry' })
    @IsUUID()
    @IsNotEmpty()
    journalEntryId!: string;

    @ApiProperty({ example: 'uuid-transaction' })
    @IsUUID()
    @IsNotEmpty()
    transactionId!: string;

    @ApiProperty({ enum: MatchType, example: 'MANUAL', default: MatchType.MANUAL })
    @IsEnum(MatchType)
    @IsOptional()
    matchType?: string;

    @ApiProperty({ example: '2026-03-24T10:00:00Z', required: false })
    @IsDateString()
    @IsOptional() 
    reconciledAt?: string;
}