// backend/src/accounting/user.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RegisterUserRequestDto, UpdateUserRequestDto, PublicUserResponseDto, UserListResponseDto } from './user.dto';
import { Public, Roles } from '../auth/decorators/index';
import { Role } from '../auth/roles';
import { CheckUserAccessGuard } from '../auth/guards/userAccess.guard';
import { ParseUserIdPipe } from '../auth/pipes/parseUserId.pipe';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { Session } from '../types/auth';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Registreer een nieuwe gebruiker' })
    @ApiResponse({ status: 201, description: 'Gebruiker succesvol aangemaakt', type: PublicUserResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request: Ongeldige invoer' })
    @ApiResponse({ status: 409, description: 'Conflict: Email adres bestaat al' })
    async register(@Body() dto: RegisterUserRequestDto): Promise<PublicUserResponseDto> {
        return await this.userService.register(dto);
    }

    @Roles(Role.ADMIN)
    @Get()
    @ApiOperation({ summary: 'Haal alle gebruikers op (alleen door admins)' })
    @ApiResponse({ status: 200, description: 'Lijst van alle gebruikers', type: UserListResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized: Geen geldige JWT token' })
    @ApiResponse({ status: 403, description: 'Forbidden: Gebruiker heeft geen ADMIN-rol' })
    async findAll(): Promise<UserListResponseDto> {
        const users = await this.userService.findAll();
        return { items: users };
    }

    @UseGuards(CheckUserAccessGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Haal een gebruiker op via id' })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'De UUID van de gebruiker OF de string "me"',
        example: '550e8400-e29b-41d4-a716-446655440000',
        required: true,
    })
    @ApiResponse({ status: 200, description: 'De gevraagde gebruiker', type: PublicUserResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden: Je hebt geen toegang tot deze gebruiker' })
    @ApiResponse({ status: 404, description: 'Not Found: Gebruiker bestaat niet' })
    async getUserById(
        @Param('id', ParseUserIdPipe) id: 'me' | string,
        @CurrentUser() user: Session,
    ): Promise<PublicUserResponseDto> {
        const userId = id === 'me' ? user.userId : id;
        return await this.userService.findById(userId);
    }

    @UseGuards(CheckUserAccessGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Pas een gebruiker aan' })
    @ApiParam({ name: 'id', type: 'string', description: 'UUID of "me"' })
    @ApiResponse({ status: 200, description: 'Gebruiker succesvol bijgewerkt', type: PublicUserResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    async updateUserById(
        @Param('id', ParseUserIdPipe) id: 'me' | string,
        @CurrentUser() user: Session,
        @Body() dto: UpdateUserRequestDto,
    ): Promise<PublicUserResponseDto> {
        const userId = id === 'me' ? user.userId : id;
        return await this.userService.updateById(userId, dto);
    }

    @UseGuards(CheckUserAccessGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Verwijder een gebruiker' })
    @ApiParam({ name: 'id', type: 'string', description: 'UUID of "me"' })
    @ApiResponse({ status: 204, description: 'Gebruiker succesvol verwijderd' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    async deleteUserById(
        @Param('id', ParseUserIdPipe) id: 'me' | string,
        @CurrentUser() user: Session,
    ): Promise<void> {
        const userId = id === 'me' ? user.userId : id;
        return await this.userService.deleteById(userId);
    }
}