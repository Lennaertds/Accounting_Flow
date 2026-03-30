// backend/src/accounting/bank-statement.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    UseGuards, Request, HttpStatus, HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BankStatementService } from './bank-statement.service';
import { CreateBankStatementDto, UpdateBankStatementDto } from './bank-statement.dto'; // Vergeet Update DTO niet
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Banking - Bank Statements')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('bank-statements')
export class BankStatementController {
    constructor(private readonly service: BankStatementService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal alle bankafschriften van de eigen organisatie op' })
    @ApiResponse({ status: 200, description: 'Lijst van afschriften succesvol opgehaald.' })
    async findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal een specifiek bankafschrift op via ID' })
    @ApiResponse({ status: 200, description: 'Afschrift gevonden.' })
    @ApiResponse({ status: 404, description: 'Afschrift niet gevonden binnen uw organisatie.' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Voeg een nieuw bankafschrift handmatig toe' })
    @ApiResponse({ status: 201, description: 'Bankafschrift succesvol aangemaakt.' })
    async create(@Body() dto: CreateBankStatementDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Werk een bankafschrift bij' })
    @ApiResponse({ status: 200, description: 'Afschrift succesvol bijgewerkt.' })
    async update(
        @Param('id') id: string, 
        @Body() dto: UpdateBankStatementDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK) 
    @ApiOperation({ summary: 'Verwijder een bankafschrift' })
    @ApiResponse({ status: 200, description: 'Afschrift succesvol verwijderd.' })
    async remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}