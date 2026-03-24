// backend/src/accounting/partner.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsBoolean, IsOptional, IsEmail, IsEnum } from 'class-validator';

export enum CommunicationChannel {
    EMAIL = 'EMAIL',
    PEPPOL = 'PEPPOL',
    PLATFORM = 'PLATFORM'
}

export class CreatePartnerDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ example: 'ACME Corp' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: true, default: false })
    @IsBoolean()
    @IsOptional()
    isPeppolReady?: boolean;

    @ApiProperty({ enum: CommunicationChannel, default: CommunicationChannel.EMAIL })
    @IsEnum(CommunicationChannel)
    @IsOptional()
    preferredOrderChannel?: string;

    @ApiProperty({ enum: CommunicationChannel, default: CommunicationChannel.PEPPOL })
    @IsEnum(CommunicationChannel)
    @IsOptional()
    preferredInvoiceChannel?: string;

    @ApiProperty({ example: 'BE0123456789', required: false })
    @IsString()
    @IsOptional()
    vatNr?: string;

    @ApiProperty({ example: '0088:12345678', required: false })
    @IsString()
    @IsOptional()
    peppolId?: string;

    @ApiProperty({ example: 'finance@acme.com', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    isCustomer?: boolean;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    isSupplier?: boolean;

    @ApiProperty({ example: 'BE12345678901234', required: false })
    @IsString()
    @IsOptional()
    bankAccountIban?: string;
}

export class UpdatePartnerDto extends CreatePartnerDto {}