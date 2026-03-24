// backend/src/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator'

@Public()
@Controller('health')
export class HealthController {
    @Get('ping')
    ping(): string {
        return 'pong';
    }
}
