// backend/src/accounting/journal.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';

export enum JournalType {
    PURCHASE = 'PURCHASE',
    SALE = 'SALE',
    BANK = 'BANK',
    CASH = 'CASH',
    GENERAL = 'GENERAL'
}

export class CreateJournalDto {
    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ example: 'Inkoopboek' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'INK', description: 'Korte code voor het dagboek' })
    @IsString()
    @IsNotEmpty()
    code!: string; 

    @ApiProperty({ enum: JournalType, example: JournalType.PURCHASE })
    @IsEnum(JournalType)
    @IsNotEmpty()
    type!: JournalType;
}

export class UpdateJournalDto extends PartialType(CreateJournalDto) {}