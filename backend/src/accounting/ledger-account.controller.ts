// backend/src/accounting/ledger-account.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LedgerAccountService } from './ledger-account.service';
import { CreateLedgerAccountDto, UpdateLedgerAccountDto } from './ledger-account.dto';

@ApiTags('Accounting - Ledger Accounts')
@ApiBearerAuth()
@Controller('ledger-accounts')
export class LedgerAccountController {
    constructor(private readonly service: LedgerAccountService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAll(orgId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateLedgerAccountDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateLedgerAccountDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}