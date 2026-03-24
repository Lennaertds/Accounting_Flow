// backend/src/app.controller.ts
import { Controller, Get, HttpCode } from '@nestjs/common';
import { Public } from './auth/decorators/index'; 

@Controller()
export class AppController {

    @Public() 
    @Get()
    getHello(): string {
        return 'Peppol ERP API is online. Raadpleeg /api voor de Swagger documentatie.';
    }

    @Public() 
    @Get('favicon.ico')
    @HttpCode(204)
    getFavicon() {
        return;
    }
}