// backend/src/accounting/organization.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrganizationDto {
    @ApiProperty({ example: 'Mijn Bedrijf BV' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'BE0123456789', required: false })
    @IsString()
    @IsOptional()
    myVatNr?: string;

    @ApiProperty({ example: 'BE44123456789012', required: false })
    @IsString()
    @IsOptional()
    myIban?: string;
}