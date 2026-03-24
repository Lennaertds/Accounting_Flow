// backend/src/accounting/journal.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsEnum } from 'class-validator';

export enum JournalType {
    PURCHASE = 'PURCHASE',
    SALE = 'SALE',
    BANK = 'BANK',
    CASH = 'CASH',
    GENERAL = 'GENERAL'
}

export class CreateJournalDto {
    @ApiProperty({ example: 'Inkoopboek' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ enum: JournalType, example: 'PURCHASE' })
    @IsEnum(JournalType)
    type!: JournalType;

    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    orgId!: string;
}

export class UpdateJournalDto {
    @ApiProperty({ example: 'Inkoopboek Hoofdkantoor' })
    @IsString()
    name?: string;

    @ApiProperty({ enum: JournalType })
    @IsEnum(JournalType)
    type?: JournalType;
}