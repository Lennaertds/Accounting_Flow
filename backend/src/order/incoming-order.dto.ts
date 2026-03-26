// backend/src/accounting/incoming-order.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum OrderSource {
    PLATFORM = 'PLATFORM',
    PEPPOL = 'PEPPOL',
    EMAIL_AI = 'EMAIL_AI'
}

export class CreateIncomingOrderDto {
    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ example: 'uuid-van-klant' })
    @IsUUID()
    @IsNotEmpty()
    customerId!: string;

    @ApiProperty({ enum: OrderSource, example: 'PEPPOL' })
    @IsEnum(OrderSource)
    @IsNotEmpty()
    source!: OrderSource;

    @ApiProperty({ example: 'PO-998877' })
    @IsString()
    @IsOptional()
    referenceExt?: string;

    @ApiProperty({ example: 450.00 })
    @IsNumber()
    @IsNotEmpty() 
    totalEstimated!: number;

    @ApiProperty({ example: 'Order bevat 5x Product X' })
    @IsString()
    @IsOptional()
    aiSummary?: string;
}

export class UpdateIncomingOrderDto extends PartialType(CreateIncomingOrderDto) {}