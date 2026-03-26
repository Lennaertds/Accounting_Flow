// backend/src/accounting/ledger-account.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum LedgerCategory {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE',
    EQUITY = 'EQUITY' 
}

export class CreateLedgerAccountDto {
    @ApiProperty({ example: 700000, description: 'Het grootboeknummer (bijv. 700000 voor omzet)' })
    @IsNumber()
    @IsNotEmpty()
    code!: number; 

    @ApiProperty({ example: 'Omzet Verkopen' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty({ message: 'Een grootboekrekening moet altijd aan een organisatie gekoppeld zijn' })
    orgId!: string;

    @ApiProperty({ enum: LedgerCategory, example: 'REVENUE' })
    @IsEnum(LedgerCategory)
    @IsNotEmpty()
    category!: LedgerCategory; 
}

export class UpdateLedgerAccountDto extends PartialType(CreateLedgerAccountDto) {}