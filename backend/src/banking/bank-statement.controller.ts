// backend/src/accounting/bank-statement.controller.ts
import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BankStatementService } from './bank-statement.service';
import { CreateBankStatementDto } from './bank-statement.dto';

@ApiTags('Banking - Bank Statements')
@ApiBearerAuth()
@Controller('bank-statements')
export class BankStatementController {
    constructor(private readonly service: BankStatementService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAll(orgId);
    }

    @Post()
    create(@Body() dto: CreateBankStatementDto) {
        return this.service.create(dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}