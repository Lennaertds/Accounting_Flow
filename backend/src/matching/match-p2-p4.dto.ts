// backend/src/accounting/match-p2-p4.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateMatchP2P4Dto {
    @ApiProperty({ 
        description: 'ID van de inkomende order (P2) van de klant',
        example: '550e8400-e29b-41d4-a716-446655440000' 
    })
    @IsUUID()
    @IsNotEmpty()
    incomingOrderId!: string;

    @ApiProperty({ 
        description: 'ID van de uitgaande factuur (P4) naar de klant',
        example: '670e8400-e29b-41d4-a716-446655441111' 
    })
    @IsUUID()
    @IsNotEmpty()
    outgoingInvoiceId!: string;

    @ApiProperty({ 
        example: 0.98, 
        description: 'AI match confidence score (tussen 0 en 1)',
        required: false 
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(1)
    matchConfidence?: number;
}

export class UpdateMatchP2P4Dto extends PartialType(CreateMatchP2P4Dto) {}

export class MatchP2P4ResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    orgId!: string;

    @ApiProperty()
    incomingOrderId!: string;

    @ApiProperty()
    outgoingInvoiceId!: string;

    @ApiProperty({ example: "0.98" })
    matchConfidence?: string;
}