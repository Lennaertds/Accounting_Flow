// backend/src/accounting/analytic-account.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticAccountService } from './analytic-account.service';
import { CreateAnalyticAccountDto, UpdateAnalyticAccountDto } from './analytic-account.dto';

@ApiTags('Accounting - Analytic Accounts')
@ApiBearerAuth()
@Controller('analytic-accounts')
export class AnalyticAccountController {
    constructor(private readonly service: AnalyticAccountService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAll(orgId);
    }

    @Post()
    create(@Body() dto: CreateAnalyticAccountDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateAnalyticAccountDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}