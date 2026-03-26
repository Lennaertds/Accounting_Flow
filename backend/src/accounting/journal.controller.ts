import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    UseGuards, Request, HttpStatus, HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { CreateJournalDto, UpdateJournalDto } from './journal.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Session } from '../types/auth';

@ApiTags('Accounting - Journals')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('journals')
export class JournalController {
    constructor(private readonly service: JournalService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal alle dagboeken van de organisatie op' })
    async findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Haal een specifiek dagboek op' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Maak een nieuw dagboek aan' })
    async create(@Body() dto: CreateJournalDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Werk een dagboek bij' })
    async update(@Param('id') id: string, @Body() dto: UpdateJournalDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verwijder een dagboek' })
    async remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}