// backend/src/accounting/analytic-account.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateAnalyticAccountDto {
    @ApiProperty({ 
        example: '550e8400-e29b-41d4-a716-446655440000', 
        description: 'UUID van de organisatie' 
    })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ 
        example: 'Marketing Q1', 
        description: 'Naam van de kostenplaats' 
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ 
        example: 'MKT-2026-Q1', 
        description: 'Unieke code voor de analytische rekening (bijv. project- of afdelingscode)' 
    })
    @IsString()
    @IsNotEmpty()
    code!: string;
}

export class UpdateAnalyticAccountDto extends PartialType(CreateAnalyticAccountDto) {}