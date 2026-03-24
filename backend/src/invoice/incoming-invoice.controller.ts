// backend/src/accounting/incoming-invoice.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IncomingInvoiceService } from './incoming-invoice.service';
import { CreateIncomingInvoiceDto, UpdateIncomingInvoiceDto } from './incoming-invoice.dto';

@ApiTags('Invoices - Incoming')
@ApiBearerAuth()
@Controller('incoming-invoices')
export class IncomingInvoiceController {
    constructor(private readonly service: IncomingInvoiceService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAll(orgId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateIncomingInvoiceDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateIncomingInvoiceDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}