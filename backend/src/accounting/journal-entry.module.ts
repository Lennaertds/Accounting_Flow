// backend/src/accounting/journal-enty.module.ts
import { Module } from '@nestjs/common';
import { JournalEntryController } from './journal-entry.controller';
import { JournalEntryService } from './journal-entry.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [JournalEntryController],
    providers: [JournalEntryService],
    exports: [JournalEntryService],
})
export class JournalEntryModule {}