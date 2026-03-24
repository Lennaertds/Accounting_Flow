// backend/src/accounting/outgoing-invoice.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OutgoingInvoiceService } from './outgoing-invoice.service';
import { CreateOutgoingInvoiceDto, UpdateOutgoingInvoiceDto } from './outgoing-invoice.dto';

@ApiTags('Invoices - Outgoing')
@ApiBearerAuth()
@Controller('outgoing-invoices')
export class OutgoingInvoiceController {
    constructor(private readonly service: OutgoingInvoiceService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAll(orgId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateOutgoingInvoiceDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateOutgoingInvoiceDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}