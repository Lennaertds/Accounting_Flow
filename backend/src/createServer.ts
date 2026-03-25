// backend/src/createServer.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { HttpExceptionFilter } from './lib/http-exception.filter';
import { DrizzleQueryErrorFilter } from './drizzle/drizzle-query-error.filter';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

export async function createServer() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const reflector = app.get(Reflector);

    // Prefix instellen (behalve voor root en favicon)
    app.setGlobalPrefix('api', {
        exclude: ['/', 'favicon.ico'],
    });

    // 📢 Beveiliging
    app.use(helmet());
    app.enableCors({
        origin: configService.get('CORS_ORIGINS', '*'),
        credentials: true,
    });

    // 📢 Pipes & Filters
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
            const formattedErrors = errors.reduce((acc, err) => {
                acc[err.property] = Object.values(err.constraints || {});
                return acc;
            }, {});
            return new BadRequestException({ details: { body: formattedErrors } });
        },
    }));

    app.useGlobalFilters(new DrizzleQueryErrorFilter(), new HttpExceptionFilter());

    // 📢 Guards
    app.useGlobalGuards(
        new AuthGuard(app.get(JwtService), configService, reflector),
        new RolesGuard(reflector),
    );

    // 📢 Swagger
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Papertrade API')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);

    const port = configService.get<number>('PORT', 3000);

    return {
        app,
        async start() {
            await app.listen(port);
            console.log(`🚀 Server running on http://localhost:${port}/docs`);
        },
    };
}