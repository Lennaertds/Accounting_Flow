// backend/src/accounting/vat-code.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    UseGuards, Request, HttpStatus, HttpCode, ParseUUIDPipe 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VatCodeService } from './vat-code.service';
import { CreateVatCodeDto, UpdateVatCodeDto } from './vat-code.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Invoices - VAT Codes')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard) // Beveiliging aansturen
@Controller('vat-codes')
export class VatCodeController {
    constructor(private readonly service: VatCodeService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal alle BTW-codes op voor de eigen organisatie' })
    @ApiResponse({ status: 200, description: 'Lijst van BTW-codes succesvol opgehaald.' })
    async findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal één specifieke BTW-code op via ID' })
    @ApiResponse({ status: 200, description: 'BTW-code gevonden.' })
    @ApiResponse({ status: 404, description: 'BTW-code niet gevonden binnen uw organisatie.' })
    async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findById(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Maak een nieuwe BTW-code aan' })
    @ApiResponse({ status: 201, description: 'BTW-code succesvol aangemaakt.' })
    async create(@Body() dto: CreateVatCodeDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update een BTW-code via ID' })
    @ApiResponse({ status: 200, description: 'BTW-code succesvol bijgewerkt.' })
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() dto: UpdateVatCodeDto,
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verwijder een BTW-code via ID' })
    @ApiResponse({ status: 200, description: 'BTW-code succesvol verwijderd.' })
    async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}