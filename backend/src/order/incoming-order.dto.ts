// backend/src/accounting/incoming-order.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum OrderSource {
    PLATFORM = 'PLATFORM',
    PEPPOL = 'PEPPOL',
    EMAIL_AI = 'EMAIL_AI'
}

export enum IncomingOrderStatus {
    RECEIVED = 'RECEIVED',
    CONFIRMED = 'CONFIRMED',
    REJECTED = 'REJECTED'
}

export class CreateIncomingOrderDto {
    @ApiProperty({ example: 'uuid-van-klant' })
    @IsUUID()
    @IsNotEmpty()
    customerId!: string;

    @ApiProperty({ example: '2026-03-29' })
    @IsDateString()
    @IsNotEmpty()
    date!: string;

    @ApiProperty({ enum: OrderSource, example: 'PEPPOL' })
    @IsEnum(OrderSource)
    @IsNotEmpty()
    source!: OrderSource;

    @ApiProperty({ example: 'PO-998877' })
    @IsString()
    @IsNotEmpty() 
    referenceExt!: string;

    @ApiProperty({ example: 450.00 })
    @IsNumber()
    @IsNotEmpty() 
    totalEstimated!: number;

    @ApiProperty({ enum: IncomingOrderStatus, default: IncomingOrderStatus.RECEIVED })
    @IsEnum(IncomingOrderStatus)
    @IsOptional()
    status?: IncomingOrderStatus; 

    @ApiProperty({ example: 'Order bevat 5x Product X' })
    @IsString()
    @IsOptional()
    aiSummary?: string;
}

export class UpdateIncomingOrderDto extends PartialType(CreateIncomingOrderDto) {}