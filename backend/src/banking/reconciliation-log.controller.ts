// backend/src/accounting/reconciliation-log.controller.ts
import { 
    Controller, Get, Post, Body, Param, 
    UseGuards, Request, HttpStatus, HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReconciliationLogService } from './reconciliation-log.service';
import { CreateReconciliationLogDto } from './reconciliation-log.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Banking - Reconciliation Logs')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('reconciliation-logs')
export class ReconciliationLogController {
    constructor(private readonly service: ReconciliationLogService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Maak een nieuwe reconciliatie-log aan' })
    @ApiResponse({ status: 201, description: 'Log succesvol aangemaakt.' })
    @ApiResponse({ status: 400, description: 'Validatiefout of ontbrekende orgId.' })
    async create(@Body() dto: CreateReconciliationLogDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal alle reconciliatie-logs van de organisatie op' })
    @ApiResponse({ status: 200, description: 'Lijst van logs succesvol opgehaald.' })
    async findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get('transaction/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Zoek logs gekoppeld aan een specifieke transactie' })
    @ApiResponse({ status: 200, description: 'Logs gevonden.' })
    @ApiResponse({ status: 404, description: 'Geen logs gevonden voor deze transactie binnen uw organisatie.' })
    async findByTransaction(@Param('id') transactionId: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findByTransaction(transactionId, user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal een specifieke log op via ID' })
    @ApiResponse({ status: 200, description: 'Log gevonden.' })
    @ApiResponse({ status: 404, description: 'Log niet gevonden.' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }
}