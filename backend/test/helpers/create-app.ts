// test/helpers/create-app.ts
import {
    INestApplication,
    ValidationPipe,
    BadRequestException,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { ValidationError } from 'class-validator';
import { AppModule } from '../../src/app.module';
import { DrizzleQueryErrorFilter } from '../../src/drizzle/drizzle-query-error.filter';
import { HttpExceptionFilter } from '../../src/lib/http-exception.filter';

export async function createApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalFilters(new DrizzleQueryErrorFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
            exceptionFactory: (errors: ValidationError[] = []) => {
                const formattedErrors = errors.reduce((acc, err) => {
                    acc[err.property] = Object.values(err.constraints || {});
                    return acc;
                }, {} as Record<string, string[]>);

                return new BadRequestException({
                    details: { body: formattedErrors },
                });
            },
        }),
    );
    await app.init();
    return app;
}