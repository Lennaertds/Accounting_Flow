// backend/src/drizzle/drizzle-query-error.filter.ts
import {
    Catch,
    ExceptionFilter,
    ArgumentsHost,
    HttpStatus,
    Logger,
    HttpException
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class DrizzleQueryErrorFilter implements ExceptionFilter {
    private readonly logger = new Logger(DrizzleQueryErrorFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // 1. Directe NestJS exceptions doorlaten (zoals UnauthorizedException of NotFound)
        if (exception instanceof HttpException) {
            return response.status(exception.getStatus()).json(exception.getResponse());
        }

        const dbErrorCode = exception?.code ?? exception?.cause?.code;
        const dbDetail = exception?.detail ?? exception?.cause?.detail; 
        
        // 2. Postgres Unique Violation (23505) 
        // Bijv: Hetzelfde BTW-nummer voor een organisatie of dubbel factuurnummer.
        if (dbErrorCode === '23505') {
            const message = process.env.NODE_ENV === 'development' 
                ? `Database Conflict: ${dbDetail || exception.message}`
                : 'A record with this unique identifier (VAT nr, Invoice nr or Email) already exists.';

            return response.status(HttpStatus.CONFLICT).json({
                statusCode: HttpStatus.CONFLICT,
                message: message,
                error: 'Conflict'
            });
        }

        // 3. Postgres Foreign Key Violation (23503)
        // Cruciaal voor: Factuur koppelen aan niet-bestaande Partner of Organisatie.
        if (dbErrorCode === '23503') {
            return response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Referenced entity (Organization, Partner or Ledger Account) does not exist.',
                error: 'Bad Request'
            });
        }

        // 4. Postgres Check Violation (23514) - Optioneel maar handig
        // Bijv: Een negatief bedrag proberen in te voeren waar dat niet mag.
        if (dbErrorCode === '23514') {
            return response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Data validation failed on database level (Check constraint).',
                error: 'Bad Request'
            });
        }

        // 5. Fallback voor onbekende fouten (SQL-injectie pogingen, syntax errors, etc.)
        this.logger.error(`❌ DB Error [${dbErrorCode}]: ${exception.message}`, exception.stack);

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: 500,
            message: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? exception.message : undefined
        });
    }
}