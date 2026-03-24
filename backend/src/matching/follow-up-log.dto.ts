// backend/src/accounting/follow-up-log.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateFollowUpLogDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    matchP5P1Id?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    matchP2P4Id?: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userId!: string;

    @ApiProperty({ example: 'Factuur klopt, prijsafspraak was gewijzigd.' })
    @IsString()
    @IsNotEmpty()
    actionTaken!: string;

    @ApiProperty({ example: 'RESOLVED' })
    @IsString()
    @IsNotEmpty()
    statusAfterAction!: string;
}