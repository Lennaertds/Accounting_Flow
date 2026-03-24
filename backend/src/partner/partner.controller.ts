// backend/src/accounting/partner.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PartnerService } from './partner.service';
import { CreatePartnerDto, UpdatePartnerDto } from './partner.dto';

@ApiTags('Core - Partners')
@ApiBearerAuth()
@Controller('partners')
export class PartnerController {
    constructor(private readonly service: PartnerService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAll(orgId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreatePartnerDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}