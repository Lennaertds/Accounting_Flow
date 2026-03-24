// backend/src/accounting/match-p2-p4.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateMatchP2P4Dto {
    @ApiProperty({ description: 'ID van de inkomende order (P2)' })
    @IsUUID()
    @IsNotEmpty()
    incomingOrderId!: string;

    @ApiProperty({ description: 'ID van de uitgaande factuur (P4)' })
    @IsUUID()
    @IsNotEmpty()
    outgoingInvoiceId!: string;

    @ApiProperty({ example: 0.98, description: 'AI match confidence score' })
    @IsNumber()
    @IsOptional()
    matchConfidence?: number;
}