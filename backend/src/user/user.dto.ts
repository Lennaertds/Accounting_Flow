// backend/src/accounting/user.dto.ts
import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserRequestDto {
    @ApiProperty({ example: 'uuid-van-organisatie' })
    @IsUUID()
    @IsNotEmpty()
    orgId!: string;

    @ApiProperty({ example: 'Piet' })
    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @ApiProperty({ example: 'Piraat' })
    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsEmail()
    @ApiProperty({ example: 'piet.piraat@gmail.com' })
    email!: string;

    @IsString()
    @MinLength(8)
    @ApiProperty({ minLength: 8, example: 'Wachtwoord123!' })
    password!: string;

    @IsOptional()
    @ApiProperty({ example: 'ADMIN', required: false })
    role?: string;
}

export class UpdateUserRequestDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsEmail()
    @IsOptional()
    email?: string;
}

export class PublicUserResponseDto {
    @ApiProperty({ example: 'uuid' })
    id!: string;

    @ApiProperty({ example: 'uuid' })
    orgId!: string;

    @ApiProperty({ example: 'Piet' })
    firstName!: string;

    @ApiProperty({ example: 'Piraat' })
    lastName!: string;

    @ApiProperty({ example: 'piet.piraat@gmail.com' })
    email!: string;

    @ApiProperty({ example: 'ADMIN' })
    role!: string;
}

export class UserListResponseDto {
    @ApiProperty({ type: [PublicUserResponseDto] })
    items!: PublicUserResponseDto[];
}