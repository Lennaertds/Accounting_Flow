// backend/src/accounting/vat-code.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VatCodeService } from './vat-code.service';
import { CreateVatCodeDto, UpdateVatCodeDto } from './vat-code.dto';

@ApiTags('Invoices - VAT Codes')
@ApiBearerAuth()
@Controller('vat-codes')
export class VatCodeController {
    constructor(private readonly service: VatCodeService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAll(orgId);
    }

    @Post()
    create(@Body() dto: CreateVatCodeDto) {
        return this.service.create(dto);
    }

    @Put(':code')
    update(
        @Param('code') code: string, 
        @Query('orgId') orgId: string, 
        @Body() dto: UpdateVatCodeDto
    ) {
        return this.service.update(code, orgId, dto);
    }

    @Delete(':code')
    remove(@Param('code') code: string, @Query('orgId') orgId: string) {
        return this.service.delete(code, orgId);
    }
}