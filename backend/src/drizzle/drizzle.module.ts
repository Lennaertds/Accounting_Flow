// backend/src/drizzle/drizzle.module.ts
import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
    type DatabaseProvider,
    DrizzleAsyncProvider,
    drizzleProvider,
    InjectDrizzle,
} from './drizzle.provider';
import path, { join } from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

@Module({
    imports: [ConfigModule],
    providers: [...drizzleProvider],
    exports: [DrizzleAsyncProvider],
})
export class DrizzleModule implements OnModuleDestroy, OnModuleInit {
    private readonly logger = new Logger(DrizzleModule.name); 

    constructor(
        @InjectDrizzle() private readonly db: DatabaseProvider,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit() {
        const runMigrations = this.configService.get<boolean>('DB_RUN_MIGRATIONS', true);

        if (!runMigrations) {
            this.logger.warn('Skipping automatic migrations based on config (DB_RUN_MIGRATIONS=false).');
            return;
        }

        this.logger.log('⏳ Running migrations...');
        await migrate(this.db, {
            migrationsFolder: join(process.cwd(), 'migrations'),
        });
        this.logger.log('✅ Migrations completed!');
    }

    async onModuleDestroy() {
        await this.db.$client.end();
    }
}