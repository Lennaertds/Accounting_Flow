import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import * as schema from './schema';
import { ConfigService } from '@nestjs/config';

export const DRIZZLE = 'DRIZZLE';

export const drizzleProvider = [
  {
    provide: DRIZZLE,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const connectionString = configService.get<string>('DATABASE_URL');
      const client = postgres(connectionString);
      return drizzle(client, { schema });
    },
  },
];