// backend/src/accounting/reconciliation-log.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { 
    IsUUID, 
    IsDateString, 
    IsNotEmpty, 
    IsOptional, 
    IsEnum 
} from 'class-validator';

export enum MatchType {
    AUTO = 'AUTO',
    MANUAL = 'MANUAL'
}

export class CreateReconciliationLogDto {
    @ApiProperty({ description: 'De organisatie ID waartoe deze log behoort' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ example: 'uuid-bank-statement', description: 'Referentie naar het bankafschrift' })
    @IsUUID()
    @IsNotEmpty()
    bankStatementId!: string;

    @ApiProperty({ example: 'uuid-journal-entry', description: 'Referentie naar de boekingsgang' })
    @IsUUID()
    @IsNotEmpty()
    journalEntryId!: string;

    @ApiProperty({ example: 'uuid-transaction', description: 'Referentie naar de specifieke grootboektransactie' })
    @IsUUID()
    @IsNotEmpty()
    transactionId!: string;

    @ApiProperty({ 
        enum: MatchType, 
        example: 'MANUAL', 
        default: MatchType.MANUAL,
        description: 'Hoe de match tot stand is gekomen' 
    })
    @IsEnum(MatchType)
    @IsOptional()
    matchType?: string;

    @ApiProperty({ 
        example: '2026-03-24T10:00:00Z', 
        required: false,
        description: 'Tijdstip van reconciliatie (default is nu)' 
    })
    @IsDateString()
    @IsOptional() 
    reconciledAt?: string;
}

export class UpdateReconciliationLogDto extends PartialType(CreateReconciliationLogDto) {}