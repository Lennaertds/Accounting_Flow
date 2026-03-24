// backend/src/accounting/incoming-order.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IncomingOrderService } from './incoming-order.service';
import { CreateIncomingOrderDto, UpdateIncomingOrderDto } from './incoming-order.dto';

@ApiTags('Orders - Incoming (P2)')
@ApiBearerAuth()
@Controller('incoming-orders')
export class IncomingOrderController {
    constructor(private readonly service: IncomingOrderService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAll(orgId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateIncomingOrderDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateIncomingOrderDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}