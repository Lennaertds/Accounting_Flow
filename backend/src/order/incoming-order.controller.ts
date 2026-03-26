// backend/src/accounting/incoming-order.controller.ts
import { 
    Controller, Get, Post, Put, Delete, Body, Param, 
    UseGuards, Request 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IncomingOrderService } from './incoming-order.service';
import { CreateIncomingOrderDto, UpdateIncomingOrderDto } from './incoming-order.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Session } from '../types/auth';

@ApiTags('Orders - Incoming (P2)')
@ApiBearerAuth()
@UseGuards(AuthGuard) 
@Controller('incoming-orders')
export class IncomingOrderController {
    constructor(private readonly service: IncomingOrderService) {}

    @Get()
    findAll(@Request() req: any) {
        const user = req.user as Session;
        return this.service.findAll(user.orgId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.findOne(id, user.orgId);
    }

    @Post()
    create(@Body() dto: CreateIncomingOrderDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Put(':id')
    update(
        @Param('id') id: string, 
        @Body() dto: UpdateIncomingOrderDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.update(id, user.orgId, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}