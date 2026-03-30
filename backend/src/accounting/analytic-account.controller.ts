// backend/src/accounting/analytic-account.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    UseGuards, Request, HttpStatus, HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticAccountService } from './analytic-account.service';
import { CreateAnalyticAccountDto, UpdateAnalyticAccountDto } from './analytic-account.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Accounting - Analytic Accounts')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('analytic-accounts')
export class AnalyticAccountController {
    constructor(private readonly service: AnalyticAccountService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal alle kostenplaatsen van de eigen organisatie op' })
    @ApiResponse({ status: 200, description: 'Lijst van kostenplaatsen succesvol opgehaald.' })
    async findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal een specifieke kostenplaats op via ID' })
    @ApiResponse({ status: 200, description: 'Kostenplaats gevonden.' })
    @ApiResponse({ status: 404, description: 'Kostenplaats niet gevonden.' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Maak een nieuwe kostenplaats aan' })
    @ApiResponse({ status: 201, description: 'Kostenplaats succesvol aangemaakt.' })
    async create(@Body() dto: CreateAnalyticAccountDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Werk een bestaande kostenplaats bij' })
    @ApiResponse({ status: 200, description: 'Kostenplaats succesvol bijgewerkt.' })
    async update(
        @Param('id') id: string, 
        @Body() dto: UpdateAnalyticAccountDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verwijder een kostenplaats' })
    @ApiResponse({ status: 200, description: 'Kostenplaats succesvol verwijderd.' })
    async remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}