// backend/src/drizzle/drizzle.provider.ts
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';
export type DatabaseProvider = NodePgDatabase<typeof schema> & {
    $client: Pool;
};

export const drizzleProvider = [
    {
        provide: DrizzleAsyncProvider,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
            const connectionString = configService.get<string>('DATABASE_URL');

            if (!connectionString) {
                throw new Error("FATAL: Environment variable DATABASE_URL is not set for Drizzle connection.");
            }

            const pool = new Pool({
                connectionString: connectionString,
                max: 5,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            });

            const db = drizzle(pool, {
                schema,
            });

            (db as DatabaseProvider).$client = pool;

            return db;
        },
    },
];

// Custom decorator voor eenvoudige injectie
import { Inject } from '@nestjs/common';
export const InjectDrizzle = () => Inject(DrizzleAsyncProvider);