// backend/src/accounting/vat-code.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateVatCodeDto {
    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty({ message: 'Elke BTW-code MOET gekoppeld zijn aan een organisatie' })
    orgId!: string;

    @ApiProperty({ example: 'BTW21', description: 'De unieke code binnen de organisatie' })
    @IsString()
    @IsNotEmpty()
    code!: string;

    @ApiProperty({ example: 21.00, description: 'Het BTW percentage' })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsNotEmpty()
    rate!: number;

    @ApiProperty({ example: '21% BTW op goederen en diensten' })
    @IsString()
    @IsNotEmpty() 
    description!: string;

    @ApiProperty({ example: 1, description: 'Het verplichte vakje op de BTW-aangifte' })
    @IsNumber()
    @IsNotEmpty() 
    taxDeclarationBox!: number;
}

export class UpdateVatCodeDto {
    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    rate?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    taxDeclarationBox?: number;
}