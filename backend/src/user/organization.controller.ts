// backend/src/accounting/organization.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './organization.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';
import { Role } from '../auth/roles';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationController {
    constructor(private readonly service: OrganizationService) {}

    @Roles(Role.ADMIN) 
    @Get()
    @ApiOperation({ summary: 'Haal alle organisaties op (Admin only)' })
    async findAll() {
        return this.service.findAll();
    }

    @Roles(Role.ADMIN) 
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Maak een nieuwe organisatie aan' })
    async create(@Body() dto: CreateOrganizationDto) {
        return this.service.create(dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Haal details van een organisatie op' })
    @ApiResponse({ status: 200, description: 'Organisatie gevonden' })
    @ApiResponse({ status: 404, description: 'Organisatie niet gevonden' })
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }
}