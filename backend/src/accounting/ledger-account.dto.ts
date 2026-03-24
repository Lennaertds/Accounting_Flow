// backend/src/accounting/ledger-account.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum LedgerCategory {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE'
}

export class CreateLedgerAccountDto {
    @ApiProperty({ example: 7000 })
    @IsNumber()
    @IsNotEmpty()
    code!: number; 

    @ApiProperty({ example: 'Omzet Verkopen' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ enum: LedgerCategory, example: 'REVENUE' })
    @IsEnum(LedgerCategory)
    @IsNotEmpty()
    category!: string;
}

export class UpdateLedgerAccountDto {
    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    code?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ enum: LedgerCategory, required: false })
    @IsEnum(LedgerCategory)
    @IsOptional()
    category?: string;
}