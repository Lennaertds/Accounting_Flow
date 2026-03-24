// backend/src/accounting/incoming-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
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
    source!: string;

    @ApiProperty({ example: 'PO-998877', description: 'Referentie van de klant' })
    @IsString()
    @IsOptional()
    referenceExt?: string;

    @ApiProperty({ example: 450.00 })
    @IsNumber()
    @IsOptional()
    totalEstimated?: number;

    @ApiProperty({ example: 'Order bevat 5x Product X, levering voor vrijdag.' })
    @IsString()
    @IsOptional()
    aiSummary?: string;
}

export class UpdateIncomingOrderDto {
    @ApiProperty({ example: 500.00, required: false })
    @IsNumber()
    @IsOptional()
    totalEstimated?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    aiSummary?: string;
}