// backend/src/accounting/reconciliation-log.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReconciliationLogService } from './reconciliation-log.service';
import { CreateReconciliationLogDto } from './reconciliation-log.dto';

@ApiTags('Banking - Reconciliation Logs')
@ApiBearerAuth()
@Controller('reconciliation-logs')
export class ReconciliationLogController {
    constructor(private readonly service: ReconciliationLogService) {}

    @Post()
    create(@Body() dto: CreateReconciliationLogDto) {
        return this.service.create(dto);
    }

    @Get('transaction/:id')
    findByTransaction(@Param('id') transactionId: string) {
        return this.service.findByTransaction(transactionId);
    }
}