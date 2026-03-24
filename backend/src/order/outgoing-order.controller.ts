// backend/src/accounting/outgoing-order.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OutgoingOrderService } from './outgoing-order.service';
import { CreateOutgoingOrderDto, UpdateOutgoingOrderStatusDto } from './outgoing-order.dto';

@ApiTags('Orders - Outgoing (P5)')
@ApiBearerAuth()
@Controller('outgoing-orders')
export class OutgoingOrderController {
    constructor(private readonly service: OutgoingOrderService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAll(orgId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateOutgoingOrderDto) {
        return this.service.create(dto);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOutgoingOrderStatusDto) {
        return this.service.updateStatus(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}