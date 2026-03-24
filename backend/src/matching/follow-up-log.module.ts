// backend/src/accounting/follow-up-log.module.ts
import { Module } from '@nestjs/common';
import { FollowUpLogController } from './follow-up-log.controller';
import { FollowUpLogService } from './follow-up-log.service';

@Module({
    controllers: [FollowUpLogController],
    providers: [FollowUpLogService],
    exports: [FollowUpLogService],
})
export class FollowUpLogModule {}