// backend/src/accounting/partner.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    UseGuards, Request, HttpStatus, HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PartnerService } from './partner.service';
import { CreatePartnerDto, UpdatePartnerDto } from './partner.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Core - Partners')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('partners')
export class PartnerController {
    constructor(private readonly service: PartnerService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal alle partners van de eigen organisatie op' })
    @ApiResponse({ status: 200, description: 'Lijst van partners succesvol opgehaald.' })
    async findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal een specifieke partner op via ID' })
    @ApiResponse({ status: 200, description: 'Partner gevonden.' })
    @ApiResponse({ status: 404, description: 'Partner niet gevonden binnen uw organisatie.' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Maak een nieuwe partner aan' })
    @ApiResponse({ status: 201, description: 'Partner succesvol aangemaakt.' })
    @ApiResponse({ status: 400, description: 'Validatiefout in de invoer.' })
    async create(@Body() dto: CreatePartnerDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Werk een bestaande partner bij' })
    @ApiResponse({ status: 200, description: 'Partner succesvol bijgewerkt.' })
    @ApiResponse({ status: 404, description: 'Partner niet gevonden of geen wijzigingsrechten.' })
    async update(
        @Param('id') id: string, 
        @Body() dto: UpdatePartnerDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK) 
    @ApiOperation({ summary: 'Verwijder een partner' })
    @ApiResponse({ status: 200, description: 'Partner succesvol verwijderd.' })
    @ApiResponse({ status: 404, description: 'Partner niet gevonden of geen verwijderrechten.' })
    async remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}