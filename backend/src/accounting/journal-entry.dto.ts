// backend/src/accounting/journal-entry.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateJournalEntryDto {
    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string; 

    @ApiProperty({ example: 'uuid-van-dagboek' })
    @IsUUID()
    @IsNotEmpty()
    journalId!: string;

    @ApiProperty({ example: '2026-03-25' })
    @IsDateString()
    @IsNotEmpty()
    date!: string;

    @ApiProperty({ example: 'Aankoop kantoorbenodigdheden' })
    @IsString()
    @IsNotEmpty()
    description!: string;
}

export class UpdateJournalEntryDto extends PartialType(CreateJournalEntryDto) {}