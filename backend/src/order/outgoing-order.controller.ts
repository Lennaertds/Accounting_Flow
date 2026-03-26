import { 
    Controller, Get, Post, Patch, Delete, Body, Param, 
    Query, UseGuards, Request 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OutgoingOrderService } from './outgoing-order.service';
import { CreateOutgoingOrderDto, UpdateOutgoingOrderDto } from './outgoing-order.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Session } from '../types/auth';

@ApiTags('Orders - Outgoing (P5)')
@ApiBearerAuth()
@UseGuards(AuthGuard) // Cruciaal: zorgt dat req.user gevuld is
@Controller('outgoing-orders')
export class OutgoingOrderController {
    constructor(private readonly service: OutgoingOrderService) {}

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
    create(@Body() dto: CreateOutgoingOrderDto, @Request() req: any) {
        const user = req.user as Session;
        return this.service.create(dto, user.orgId);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string, 
        @Body() dto: UpdateOutgoingOrderDto, 
        @Request() req: any
    ) {
        const user = req.user as Session;
        return this.service.updateStatus(id, user.orgId, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        const user = req.user as Session;
        return this.service.delete(id, user.orgId);
    }
}