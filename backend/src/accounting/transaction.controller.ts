// backend/src/accounting/transaction.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    Query, UseGuards, Request, HttpStatus, HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Accounting - Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard) 
@Controller('transactions')
export class TransactionController {
    constructor(private readonly service: TransactionService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal transacties op (optioneel gefilterd per boekstuk)' })
    @ApiResponse({ status: 200, description: 'Lijst van transacties succesvol opgehaald.' })
    async findAll(
        @Query('journalEntryId') journalEntryId: string, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        if (journalEntryId) {
            return this.service.findAllByEntry(journalEntryId, user.orgId);
        }
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal een specifieke transactieregel op' })
    @ApiResponse({ status: 200, description: 'Transactie gevonden.' })
    @ApiResponse({ status: 404, description: 'Transactie niet gevonden.' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Voeg een nieuwe transactieregel toe aan een boekstuk' })
    @ApiResponse({ status: 201, description: 'Transactie succesvol aangemaakt.' })
    @ApiResponse({ status: 400, description: 'Validatiefout of boekstuk niet gevonden.' })
    async create(@Body() dto: CreateTransactionDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Werk een specifieke transactieregel bij' })
    @ApiResponse({ status: 200, description: 'Transactie succesvol bijgewerkt.' })
    @ApiResponse({ status: 404, description: 'Transactie niet gevonden.' })
    async update(
        @Param('id') id: string, 
        @Body() dto: UpdateTransactionDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verwijder een transactieregel' })
    @ApiResponse({ status: 200, description: 'Transactie succesvol verwijderd.' })
    @ApiResponse({ status: 404, description: 'Transactie niet gevonden.' })
    async remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}