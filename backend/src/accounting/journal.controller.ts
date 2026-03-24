// backend/src/accounting/journal.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { CreateJournalDto, UpdateJournalDto } from './journal.dto';

@ApiTags('Accounting - Journals')
@ApiBearerAuth()
@Controller('journals')
export class JournalController {
    constructor(private readonly service: JournalService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAll(orgId);
    }

    @Post()
    create(@Body() dto: CreateJournalDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateJournalDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}