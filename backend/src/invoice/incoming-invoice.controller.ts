// backend/src/accounting/incoming-invoice.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    UseGuards, Request, HttpStatus, HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IncomingInvoiceService } from './incoming-invoice.service';
import { CreateIncomingInvoiceDto, UpdateIncomingInvoiceDto } from './incoming-invoice.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Invoices - Incoming')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('incoming-invoices')
export class IncomingInvoiceController {
    constructor(private readonly service: IncomingInvoiceService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal alle inkomende facturen van de eigen organisatie op' })
    @ApiResponse({ status: 200, description: 'Lijst van inkomende facturen succesvol opgehaald.' })
    async findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal een specifieke inkomende factuur op via ID' })
    @ApiResponse({ status: 200, description: 'Factuur gevonden.' })
    @ApiResponse({ status: 404, description: 'Factuur niet gevonden binnen uw organisatie.' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Registreer een nieuwe inkomende factuur' })
    @ApiResponse({ status: 201, description: 'Factuur succesvol aangemaakt.' })
    @ApiResponse({ status: 400, description: 'Validatiefout in de invoer.' })
    async create(@Body() dto: CreateIncomingInvoiceDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Werk een bestaande inkomende factuur bij' })
    @ApiResponse({ status: 200, description: 'Factuur succesvol bijgewerkt.' })
    @ApiResponse({ status: 404, description: 'Factuur niet gevonden of geen wijzigingsrechten.' })
    async update(
        @Param('id') id: string, 
        @Body() dto: UpdateIncomingInvoiceDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK) 
    @ApiOperation({ summary: 'Verwijder een inkomende factuur' })
    @ApiResponse({ status: 200, description: 'Factuur succesvol verwijderd.' })
    @ApiResponse({ status: 404, description: 'Factuur niet gevonden of geen verwijderrechten.' })
    async remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}