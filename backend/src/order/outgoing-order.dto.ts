// backend/src/order/outgoing-order.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';

export enum OrderChannel {
    EMAIL = 'EMAIL',
    PEPPOL = 'PEPPOL',
    PLATFORM = 'PLATFORM'
}

export enum OutgoingOrderStatus {
    ORDERED = 'ORDERED',
    RECEIVED = 'RECEIVED',
    INVOICED = 'INVOICED'
}

export class CreateOutgoingOrderDto {
    @ApiProperty({ example: 'uuid-van-leverancier' })
    @IsUUID()
    @IsNotEmpty()
    supplierId!: string;

    @ApiProperty({ example: 'ORD-2026-001' })
    @IsString()
    @IsNotEmpty()
    orderNr!: string;

    @ApiProperty({ example: '2026-03-29' })
    @IsDateString()
    @IsNotEmpty()
    date!: string; // <--- TOEGEVOEGD

    @ApiProperty({ example: 1500.00 })
    @IsNumber()
    @IsNotEmpty()
    totalEstimated!: number; // <--- TOEGEVOEGD

    @ApiProperty({ enum: OrderChannel, example: 'PEPPOL' })
    @IsEnum(OrderChannel)
    @IsNotEmpty()
    channel!: OrderChannel; 

    @ApiProperty({ enum: OutgoingOrderStatus, default: OutgoingOrderStatus.ORDERED })
    @IsEnum(OutgoingOrderStatus)
    @IsOptional()
    status?: OutgoingOrderStatus;
}

export class UpdateOutgoingOrderDto extends PartialType(CreateOutgoingOrderDto) {}