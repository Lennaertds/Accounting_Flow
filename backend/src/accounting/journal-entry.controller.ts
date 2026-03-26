// backend/src/accounting/journal-entry.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    Query, UseGuards, Request 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JournalEntryService } from './journal-entry.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from './journal-entry.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Accounting - Journal Entries')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard) 
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
    async create(@Body() dto: CreateJournalEntryDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
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