// backend/src/accounting/journal-entry.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JournalEntryService } from './journal-entry.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from './journal-entry.dto';

@ApiTags('Accounting - Journal Entries')
@ApiBearerAuth()
@Controller('journal-entries')
export class JournalEntryController {
    constructor(private readonly service: JournalEntryService) {}

    @Get()
    findAll(@Query('journalId') journalId: string) {
        return this.service.findAllByJournal(journalId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateJournalEntryDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateJournalEntryDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}