// test/helpers/login.ts
import { INestApplication, Logger } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { SEED_USERS } from '../../src/drizzle/seed-data';

const logger = new Logger('LoginHelper');

export const login = async (
    app: INestApplication, 
    email: string, 
    providedPassword?: string
): Promise<string> => {
    const authService = app.get(AuthService);

    // 1. Zoek de gebruiker op in de seed-data om het juiste wachtwoord te vinden
    const seedUser = SEED_USERS.find(u => u.email === email);
    
    // 2. Bepaal het wachtwoord: 
    //    Prioriteit: 1. Handmatig meegegeven in test, 2. Uit seed-data, 3. Default 'password123'
    const password = providedPassword || seedUser?.password || 'password123';

    try {
        const token = await authService.login({ email, password });
        if (!token) throw new Error(`No token received for ${email}`);
        return token;
    } catch (error) {
        logger.error(`Login failed for ${email} with password: ${password}`);
        throw error;
    }
};

export const loginAdmin = async (app: INestApplication): Promise<string> => {
    const adminUser = SEED_USERS.find(u => u.role === 'ADMIN');
    if (!adminUser) throw new Error("No ADMIN user found in SEED_USERS");
    
    return login(app, adminUser.email, adminUser.password);
};