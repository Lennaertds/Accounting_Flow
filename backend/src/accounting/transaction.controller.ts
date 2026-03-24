// backend/src/accounting/transaction.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';

@ApiTags('Accounting - Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionController {
    constructor(private readonly service: TransactionService) {}

    @Get()
    findAll(@Query('journalEntryId') journalEntryId: string) {
        return this.service.findAllByEntry(journalEntryId);
    }

    @Post()
    create(@Body() dto: CreateTransactionDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}