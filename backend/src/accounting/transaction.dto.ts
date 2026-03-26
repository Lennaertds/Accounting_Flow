import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateTransactionDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    orgId!: string; 

    @ApiProperty({ example: 'uuid-van-entry' })
    @IsUUID()
    @IsNotEmpty()
    entryId!: string;

    @ApiProperty({ example: 'uuid-van-grootboekrekening' })
    @IsUUID()
    @IsNotEmpty()
    ledgerId!: string; 

    @ApiProperty({ example: 'uuid-van-analytic-account', required: false })
    @IsUUID()
    @IsOptional()
    analyticAccountId?: string;

    @ApiProperty({ example: 1250.75 })
    @IsNumber()
    @IsNotEmpty()
    amount!: number;

    @ApiProperty({ example: false, default: false })
    @IsBoolean()
    @IsOptional()
    isReconciled?: boolean;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}