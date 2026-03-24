// backend/src/accounting/follow-up-log.controller.ts
import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FollowUpLogService } from './follow-up-log.service';
import { CreateFollowUpLogDto } from './follow-up-log.dto';

@ApiTags('Matching - Follow-up Logs')
@ApiBearerAuth()
@Controller('follow-up-logs')
export class FollowUpLogController {
    constructor(private readonly service: FollowUpLogService) {}

    @Get()
    findAll(@Query('orgId') orgId: string) {
        return this.service.findAllByOrg(orgId);
    }

    @Post()
    create(@Body() dto: CreateFollowUpLogDto) {
        return this.service.create(dto);
    }

    @Get('match/:type/:id')
    findByMatch(
        @Param('id') matchId: string,
        @Param('type') type: 'P5P1' | 'P2P4'
    ) {
        return this.service.findByMatch(matchId, type);
    }
}