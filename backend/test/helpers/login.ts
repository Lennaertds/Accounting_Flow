// test/helpers/login.ts
import { INestApplication, Logger } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';

const logger = new Logger('LoginHelper');

export const login = async (app: INestApplication, email = "accountant@alpha.com", password = 'password123'): Promise<string> => {
    const authService = app.get(AuthService);
    const token = await authService.login({ email, password });

    if (!token) throw new Error(`No token received for ${email}`);
    return token;
};

export const loginAdmin = async (app: INestApplication): Promise<string> => {
    return login(app, 'admin@test.com', 'password123');
};