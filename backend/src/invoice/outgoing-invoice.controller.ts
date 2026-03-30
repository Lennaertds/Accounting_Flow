// backend/src/accounting/outgoing-invoice.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    UseGuards, Request, HttpStatus, HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OutgoingInvoiceService } from './outgoing-invoice.service';
import { CreateOutgoingInvoiceDto, UpdateOutgoingInvoiceDto } from './outgoing-invoice.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Invoices - Outgoing')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('outgoing-invoices')
export class OutgoingInvoiceController {
    constructor(private readonly service: OutgoingInvoiceService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal alle uitgaande facturen van de eigen organisatie op' })
    @ApiResponse({ status: 200, description: 'Lijst van verkoopfacturen succesvol opgehaald.' })
    async findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal een specifieke uitgaande factuur op' })
    @ApiResponse({ status: 200, description: 'Factuur gevonden.' })
    @ApiResponse({ status: 404, description: 'Factuur niet gevonden binnen uw organisatie.' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Maak een nieuwe uitgaande factuur aan' })
    @ApiResponse({ status: 201, description: 'Verkoopfactuur succesvol aangemaakt.' })
    async create(@Body() dto: CreateOutgoingInvoiceDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Werk een uitgaande factuur bij' })
    @ApiResponse({ status: 200, description: 'Factuur succesvol bijgewerkt.' })
    async update(
        @Param('id') id: string, 
        @Body() dto: UpdateOutgoingInvoiceDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK) 
    @ApiOperation({ summary: 'Verwijder een uitgaande factuur' })
    @ApiResponse({ status: 200, description: 'Factuur succesvol verwijderd.' })
    async remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}