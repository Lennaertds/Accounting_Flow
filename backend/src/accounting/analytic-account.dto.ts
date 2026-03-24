// backend/src/accounting/analytic-account.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateAnalyticAccountDto {
    @ApiProperty({ example: 'Marketing' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'MKT-001', description: 'Unieke code voor de analytische rekening' })
    @IsString()
    @IsNotEmpty()
    code!: string;

    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;
}

export class UpdateAnalyticAccountDto {
    @ApiProperty({ example: 'Marketing - Europa', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: 'MKT-002', required: false })
    @IsOptional()
    @IsString()
    code?: string;
}