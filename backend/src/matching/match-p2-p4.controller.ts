// backend/src/accounting/match-p2-p4.controller.ts
import { 
    Controller, Get, Post, Body, Param, 
    UseGuards, Request 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MatchP2P4Service } from './match-p2-p4.service';
import { CreateMatchP2P4Dto } from './match-p2-p4.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Session } from '../types/auth';

@ApiTags('Matching - P2 to P4 (Incoming Orders vs Sales Invoices)')
@ApiBearerAuth()
@UseGuards(AuthGuard) // <--- Cruciaal voor sessie-beveiliging
@Controller('match-p2-p4')
export class MatchP2P4Controller {
    constructor(private readonly service: MatchP2P4Service) {}

    @Post()
    @ApiOperation({ summary: 'Koppel een inkomende order (P2) aan een uitgaande factuur (P4)' })
    create(@Body() dto: CreateMatchP2P4Dto, @Request() req: any) {
        const user = req.user as Session;
        // We geven de orgId mee om te valideren dat de order en factuur van deze organisatie zijn
        return this.service.create(dto, user.orgId);
    }

    @Get('invoice/:id')
    @ApiOperation({ summary: 'Haal alle matches op voor een specifieke uitgaande factuur' })
    findByInvoice(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findByInvoice(id, user.orgId);
    }

    @Get('order/:id')
    @ApiOperation({ summary: 'Haal alle matches op voor een specifieke inkomende order' })
    findByOrder(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findByOrder(id, user.orgId);
    }
}