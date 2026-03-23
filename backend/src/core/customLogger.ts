// backend/src/core/customLogger.ts
import type { LoggerService } from '@nestjs/common';
import { ConsoleLogger } from '@nestjs/common';

export default class CustomLogger
    extends ConsoleLogger
    implements LoggerService {

    // 📢 Algemene logs (2xx)
    log(message: string) {
        super.log('📢 ' + message);
    }

    // ❌ Fouten (5xx)
    error(message: string, trace: string) {
        super.error('❌  ' + message, trace);
    }

    // ⚠️ Waarschuwingen (4xx, tenzij een Bad Request)
    warn(message: string) {
        super.warn('⚠️  ' + message);
    }

    // 🐞 Debugging
    debug(message: string) {
        super.debug('🐞 ' + message);
    }

    // 📖 Gedetailleerde/verbose logs
    verbose(message: string) {
        super.verbose('📖 ' + message);
    }
}