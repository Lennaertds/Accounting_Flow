// backend/src/accounting/follow-up-log.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    UseGuards, Request, HttpStatus, HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FollowUpLogService } from './follow-up-log.service';
import { CreateFollowUpLogDto, UpdateFollowUpLogDto } from './follow-up-log.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Matching - Follow-up Logs')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('follow-up-logs')
export class FollowUpLogController {
    constructor(private readonly service: FollowUpLogService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal alle follow-up logs van de eigen organisatie op' })
    @ApiResponse({ status: 200, description: 'Lijst van logs succesvol opgehaald.' })
    async findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal een specifieke follow-up log op via ID' })
    @ApiResponse({ status: 200, description: 'Log gevonden.' })
    @ApiResponse({ status: 404, description: 'Log niet gevonden binnen uw organisatie.' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Maak een nieuwe follow-up log aan' })
    @ApiResponse({ status: 201, description: 'Log succesvol aangemaakt.' })
    async create(@Body() dto: CreateFollowUpLogDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Get('match/:type/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Zoek logs gekoppeld aan een specifieke match' })
    async findByMatch(
        @Param('id') matchId: string,
        @Param('type') type: 'P5P1' | 'P2P4',
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.findByMatch(matchId, type, user.orgId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Werk een bestaande follow-up log bij' })
    async update(
        @Param('id') id: string, 
        @Body() dto: UpdateFollowUpLogDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK) 
    @ApiOperation({ summary: 'Verwijder een follow-up log' })
    async remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}