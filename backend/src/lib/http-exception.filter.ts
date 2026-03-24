// backend/src/lib/http-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const resBody: any = exception.getResponse();

        const message = resBody.message || exception.message;

        response.status(status).json({
            statusCode: status,
            message: message,
            details: resBody.details || undefined,
            error: resBody.error || exception.name
        });
    }
}