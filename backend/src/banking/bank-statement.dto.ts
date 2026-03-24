// backend/src/accounting/bank-statement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateBankStatementDto {
    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ example: '2026-03-24' })
    @IsDateString()
    date!: string;

    @ApiProperty({ example: 'BE12345678901234' })
    @IsString()
    @IsNotEmpty()
    iban!: string;

    @ApiProperty({ example: 125.50 })
    @IsNumber()
    @IsNotEmpty()
    amount!: number;

    @ApiProperty({ example: 'Mededeling: Betaling Factuur 2024-001', required: false })
    @IsString()
    @IsOptional()
    reference?: string;
}

export class UpdateBankStatementDto {
    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    amount?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    reference?: string;
}