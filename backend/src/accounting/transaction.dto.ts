// backend/src/accounting/transaction.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class CreateTransactionDto {
    @ApiProperty({ example: 'uuid-van-entry' })
    @IsUUID()
    entryId!: string;

    @ApiProperty({ example: 7000, description: 'De numerieke grootboekcode' })
    @IsNumber()
    ledgerCode!: number; 

    @ApiProperty({ example: 'uuid-van-analytic-account', required: false })
    @IsUUID()
    @IsOptional()
    analyticAccountId?: string;

    @ApiProperty({ example: 1250.75 })
    @IsNumber()
    amount!: number;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsOptional()
    isReconciled?: boolean;
}

export class UpdateTransactionDto {
    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    ledgerCode?: number;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    analyticAccountId?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    amount?: number;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isReconciled?: boolean;
}