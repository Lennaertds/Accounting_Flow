// backend/src/session/session.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';
import { IsString as NsdIsString } from 'nestjs-swagger-dto';


export class LoginRequestDto {
    @IsEmail()
    @ApiProperty({
        description: 'E-mailadres van de gebruiker',
        example: 'piet.piraat@gmail.com',
    })
    email: string;

    @NsdIsString({
        name: 'password',
        minLength: 8,
        description: 'Wachtwoord (minimaal 8 karakters)',
        example: 'stringst'
    })
    password: string;
}

export class LoginResponseDto {
    @ApiProperty({
        description: 'De JSON Web Token (JWT) die gebruikt moet worden in de Authorization header (Bearer)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6y'
    })
    token: string;
}