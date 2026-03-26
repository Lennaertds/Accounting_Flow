// backend/src/accounting/transaction.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    Query, UseGuards, Request 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Session } from '../types/auth';

@ApiTags('Accounting - Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard) 
@Controller('transactions')
export class TransactionController {
    constructor(private readonly service: TransactionService) {}

    @Get()
    findAll(@Query('journalEntryId') journalEntryId: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findAllByEntry(journalEntryId, user.orgId);
    }

    @Post()
    create(@Body() dto: CreateTransactionDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTransactionDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}