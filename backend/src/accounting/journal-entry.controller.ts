// backend/src/accounting/journal-entry.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    Query, UseGuards, Request, HttpStatus, HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
    @ApiOperation({ summary: 'Haal alle boekingen op (optioneel gefilterd per dagboek)' })
    async findAll(@Query('journalId') journalId: string, @Request() req: any) {
        const user = req.user as Session;
        // We voegen orgId toe om te voorkomen dat je entries van andere orgs ziet
        return this.service.findAllByJournal(journalId, user.orgId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Haal een specifieke boeking op' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Maak een nieuwe boeking' })
    async create(@Body() dto: CreateJournalEntryDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Wijzig een boeking' })
    update(
        @Param('id') id: string, 
        @Body() dto: UpdateJournalEntryDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        // Cruciaal: geef orgId mee voor veiligheid
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Verwijder een boeking' })
    remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        // Cruciaal: geef orgId mee voor veiligheid
        return this.service.delete(id, user.orgId);
    }
}