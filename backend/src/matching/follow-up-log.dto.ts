// backend/src/accounting/follow-up-log.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateFollowUpLogDto {
    @ApiProperty({ description: 'De organisatie ID waartoe deze log behoort' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ 
        example: 'uuid-p5p1', 
        required: false, 
        description: 'Referentie naar een P5P1 match (indien van toepassing)' 
    })
    @IsUUID()
    @IsOptional()
    matchP5P1Id?: string;

    @ApiProperty({ 
        example: 'uuid-p2p4', 
        required: false, 
        description: 'Referentie naar een P2P4 match (indien van toepassing)' 
    })
    @IsUUID()
    @IsOptional()
    matchP2P4Id?: string;

    @ApiProperty({ description: 'De gebruiker die deze actie heeft uitgevoerd' })
    @IsUUID()
    @IsNotEmpty()
    userId!: string;

    @ApiProperty({ 
        example: 'Factuur klopt, prijsafspraak was gewijzigd.', 
        description: 'Beschrijving van de ondernomen actie' 
    })
    @IsString()
    @IsNotEmpty()
    actionTaken!: string;

    @ApiProperty({ 
        example: 'RESOLVED', 
        description: 'De status van de match na deze actie' 
    })
    @IsString()
    @IsNotEmpty()
    statusAfterAction!: string;
}

export class UpdateFollowUpLogDto extends PartialType(CreateFollowUpLogDto) {}