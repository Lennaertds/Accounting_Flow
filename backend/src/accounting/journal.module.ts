// backend/src/accounting/journal.module.ts
import { Module } from '@nestjs/common';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [JournalController],
    providers: [JournalService],
    exports: [JournalService],
})
export class JournalModule {}