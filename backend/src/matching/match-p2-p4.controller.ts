// backend/src/accounting/match-p2-p4.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MatchP2P4Service } from './match-p2-p4.service';
import { CreateMatchP2P4Dto } from './match-p2-p4.dto';

@ApiTags('Matching - P2 to P4 (Orders vs Sales Invoices)')
@ApiBearerAuth()
@Controller('match-p2-p4')
export class MatchP2P4Controller {
    constructor(private readonly service: MatchP2P4Service) {}

    @Post()
    create(@Body() dto: CreateMatchP2P4Dto) {
        return this.service.create(dto);
    }

    @Get('invoice/:id')
    findByInvoice(@Param('id') id: string) {
        return this.service.findByInvoice(id);
    }

    @Get('order/:id')
    findByOrder(@Param('id') id: string) {
        return this.service.findByOrder(id);
    }
}