// backend/src/accounting/match-p5-p1.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MatchP5P1Service } from './match-p5-p1.service';
import { CreateMatchP5P1Dto } from './match-p5-p1.dto';

@ApiTags('Matching - P5 to P1 (Purchase Orders vs Supplier Invoices)')
@ApiBearerAuth()
@Controller('match-p5-p1')
export class MatchP5P1Controller {
    constructor(private readonly service: MatchP5P1Service) {}

    @Post()
    create(@Body() dto: CreateMatchP5P1Dto) {
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