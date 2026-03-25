// backend/src/main.ts
import { createServer } from './createServer';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const server = await createServer();
    await server.start();
}

bootstrap().catch((err) => {
    new Logger('Bootstrap').error('Fatal error during startup', err);
    process.exit(1);
});