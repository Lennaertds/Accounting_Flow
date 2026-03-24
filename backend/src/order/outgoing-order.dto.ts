// backend/src/accounting/outgoing-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum } from 'class-validator';

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
    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ example: 'uuid-van-leverancier' })
    @IsUUID()
    @IsNotEmpty()
    supplierId!: string;

    @ApiProperty({ enum: OrderChannel, example: 'PEPPOL' })
    @IsEnum(OrderChannel)
    @IsNotEmpty()
    channel!: string;

    @ApiProperty({ enum: OutgoingOrderStatus, default: OutgoingOrderStatus.ORDERED })
    @IsEnum(OutgoingOrderStatus)
    @IsOptional()
    status?: string;
}

export class UpdateOutgoingOrderStatusDto {
    @ApiProperty({ enum: OutgoingOrderStatus })
    @IsEnum(OutgoingOrderStatus)
    @IsNotEmpty()
    status!: string;
}