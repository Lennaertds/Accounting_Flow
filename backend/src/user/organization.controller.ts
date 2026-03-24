// backend/src/accounting/organization.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './organization.dto';

@ApiTags('User - Organizations')
@Controller('organizations')
export class OrganizationController {
    constructor(private readonly service: OrganizationService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Post()
    create(@Body() dto: CreateOrganizationDto) {
        return this.service.create(dto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }
}