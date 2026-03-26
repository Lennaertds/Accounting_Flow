// backend/src/accounting/ledger-account.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    UseGuards, Request, HttpStatus, HttpCode, ParseUUIDPipe 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LedgerAccountService } from './ledger-account.service';
import { CreateLedgerAccountDto, UpdateLedgerAccountDto } from './ledger-account.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Accounting - Ledger Accounts')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('ledger-accounts')
export class LedgerAccountController {
    constructor(private readonly service: LedgerAccountService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal alle grootboekrekeningen van de eigen organisatie op' })
    @ApiResponse({ status: 200, description: 'Lijst van grootboekrekeningen succesvol opgehaald.' })
    async findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal een specifieke grootboekrekening op via ID' })
    @ApiResponse({ status: 200, description: 'Grootboekrekening gevonden.' })
    @ApiResponse({ status: 404, description: 'Grootboekrekening niet gevonden binnen uw organisatie.' })
    async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Maak een nieuwe grootboekrekening aan' })
    @ApiResponse({ status: 201, description: 'Grootboekrekening succesvol aangemaakt.' })
    @ApiResponse({ status: 400, description: 'Validatiefout of dubbele code binnen de organisatie.' })
    async create(@Body() dto: CreateLedgerAccountDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Werk een bestaande grootboekrekening bij' })
    @ApiResponse({ status: 200, description: 'Grootboekrekening succesvol bijgewerkt.' })
    @ApiResponse({ status: 404, description: 'Rekening niet gevonden of geen wijzigingsrechten.' })
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() dto: UpdateLedgerAccountDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK) 
    @ApiOperation({ summary: 'Verwijder een grootboekrekening' })
    @ApiResponse({ status: 200, description: 'Grootboekrekening succesvol verwijderd.' })
    @ApiResponse({ status: 404, description: 'Rekening niet gevonden of geen verwijderrechten.' })
    async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}