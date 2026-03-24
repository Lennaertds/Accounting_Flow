// backend/src/accounting/journal-entry.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateJournalEntryDto {
    @ApiProperty({ example: 'uuid-van-dagboek' })
    @IsUUID()
    journalId!: string;

    @ApiProperty({ example: '2023-10-27' })
    @IsDateString()
    date!: string;

    @ApiProperty({ example: 'Aankoop kantoorbenodigdheden', required: false })
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateJournalEntryDto {
    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    date?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;
}