// backend/src/accounting/match-p5-p1.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateMatchP5P1Dto {
    @ApiProperty({ description: 'ID van de uitgaande order (P5)' })
    @IsUUID()
    @IsNotEmpty()
    outgoingOrderId!: string;

    @ApiProperty({ description: 'ID van de inkomende factuur (P1)' })
    @IsUUID()
    @IsNotEmpty()
    incomingInvoiceId!: string;

    @ApiProperty({ example: 0.95, description: 'AI match confidence score', required: false })
    @IsNumber()
    @IsOptional()
    matchConfidence?: number;
}