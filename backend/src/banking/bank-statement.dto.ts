// backend/src/accounting/bank-statement.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { 
    IsString, 
    IsNotEmpty, 
    IsUUID, 
    IsDateString, 
    IsNumber, 
    IsOptional, 
    IsDecimal 
} from 'class-validator';

export class CreateBankStatementDto {
    @ApiProperty({ description: 'De organisatie ID waartoe dit afschrift behoort' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ example: '2026-03-24', description: 'Datum van de verrichting' })
    @IsDateString()
    @IsNotEmpty()
    date!: string;

    @ApiProperty({ example: '125.50', description: 'Bedrag (positief voor ontvangst, negatief voor uitgave)' })
    @IsNotEmpty()
    amount!: string | number;

    @ApiProperty({ example: 'Mededeling: Betaling Factuur 2024-001', required: false })
    @IsString()
    @IsOptional()
    communication?: string;

    @ApiProperty({ example: 'BE12345678901234', required: false })
    @IsString()
    @IsOptional()
    counterpartyIban?: string;

    @ApiProperty({ example: 'BANK-REF-2026-XYZ', description: 'Uniek referentienummer van de bank' })
    @IsString()
    @IsNotEmpty()
    bankReference!: string;
}

export class UpdateBankStatementDto extends PartialType(CreateBankStatementDto) {}