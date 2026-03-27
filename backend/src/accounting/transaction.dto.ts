// backend/src/accounting/transaction.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { 
    IsUUID, 
    IsNotEmpty, 
    IsOptional, 
    IsNumber, 
    IsBoolean, 
    IsDecimal, 
    IsString 
} from 'class-validator';

export class CreateTransactionDto {
    @ApiProperty({ description: 'De organisatie waartoe deze regel behoort' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string; 

    @ApiProperty({ example: 'uuid-van-entry', description: 'Koppeling naar de Journal Entry (de kop)' })
    @IsUUID()
    @IsNotEmpty()
    entryId!: string;

    @ApiProperty({ example: 'uuid-van-grootboekrekening', description: 'De MAR-rekening (bijv. 604000)' })
    @IsUUID()
    @IsNotEmpty()
    ledgerId!: string; 

    @ApiProperty({ 
        example: 'uuid-van-analytic-account', 
        required: false, 
        description: 'Optionele kostenplaats' 
    })
    @IsUUID()
    @IsOptional()
    analyticAccountId?: string;

    @ApiProperty({ 
        example: 1250.75, 
        description: 'Bedrag (positief = debet, negatief = credit)' 
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    amount!: number;

    @ApiProperty({ 
        example: false, 
        default: false, 
        description: 'Is deze regel al afgepoint met een banktransactie?' 
    })
    @IsBoolean()
    @IsOptional()
    isReconciled?: boolean;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}