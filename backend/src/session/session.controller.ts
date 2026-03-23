// backend/src/session/session.controller.ts
import { Controller, Post, Body, HttpStatus, HttpCode, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { LoginRequestDto, LoginResponseDto } from './session.dto';
import { Public } from '../auth/decorators/public.decorator';
import { AuthDelayInterceptor } from '../auth/interceptors/authDelay.interceptor';

@ApiBearerAuth()
@ApiTags('Session (Authentication)')
@UseInterceptors(AuthDelayInterceptor)
@Controller('sessions') 
export class SessionController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Log in en ontvang een JWT token' }) 
    @ApiBody({
        type: LoginRequestDto, 
        description: 'E-mailadres en wachtwoord om in te loggen',
    })
    @ApiResponse({
        status: 200,
        description: 'Succesvolle login, retourneert de JWT token',
        type: LoginResponseDto, 
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized: Ongeldige e-mail of wachtwoord',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request: Ongeldige invoer (validatie mislukt)',
    })
    async signIn(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
        const token = await this.authService.login(loginDto);
        return { token };
    }
}