// backend/src/auth/auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { users } from '../drizzle/schema';
import { eq, InferInsertModel } from 'drizzle-orm';
import { LoginRequestDto } from '../session/session.dto';
import { Role } from './roles';
import { RegisterUserRequestDto } from '../user/user.dto';
import { type DatabaseProvider, InjectDrizzle } from '../drizzle/drizzle.provider';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectDrizzle()
        private readonly db: DatabaseProvider,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.logger.debug(`[AUTH-INIT] Argon Config -> Time: ${this.configService.get('ARGON_TIME_COST')}, Memory: ${this.configService.get('ARGON_MEMORY_COST')}`);
    }

    async hashPassword(password: string): Promise<string> {
        const timeCost = Number(this.configService.get('ARGON_TIME_COST')) || 2;
        const memoryCost = Number(this.configService.get('ARGON_MEMORY_COST')) || 1024;

        this.logger.debug(`[HASH] Start hashing... Password length: ${password?.length}`);

        const hash = await argon2.hash(password, {
            type: argon2.argon2id,
            timeCost,
            memoryCost,
        });

        this.logger.debug(`[HASH] Gegenereerde hash (eerste 15 tekens): ${hash.substring(0, 15)}`);
        return hash;
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        this.logger.debug(`[VERIFY] Poging verificatie...`);
        this.logger.debug(`[VERIFY] Inkomend wachtwoord lengte: ${password?.length}`);
        this.logger.debug(`[VERIFY] Database hash (eerste 15 tekens): ${hash?.substring(0, 15)}`);

        try {
            const result = await argon2.verify(hash, password);
            this.logger.debug(`[VERIFY] Match resultaat: ${result}`);
            return result;
        } catch (error) {
            this.logger.error(`[VERIFY] CRITICAL ERROR bij Argon2: ${error.message}`);
            return false;
        }
    }

    async login({ email, password }: LoginRequestDto): Promise<string> {
        // this.logger.log(`[LOGIN] Start inlogpoging voor: ${email}`);

        const dbUrl = this.configService.get('DATABASE_URL');
        // this.logger.debug(`[LOGIN] Database URL in gebruik: ${dbUrl?.split('@')[1]}`);

        const user = await this.db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            this.logger.warn(`[LOGIN] USER NIET GEVONDEN! Gezochte email: ${email}`);
            throw new UnauthorizedException('The given email and password do not match');
        }

        // this.logger.debug(`[LOGIN] User gevonden. Rollen: ${JSON.stringify(user.roles)}`);
        // this.logger.debug(`[LOGIN] Vergelijken van wachtwoord: "${password}" met hash: "${user.passwordHash.substring(0, 20)}..."`);

        const isMatch = await this.verifyPassword(password, user.passwordHash);

        if (!isMatch) {
            this.logger.error(`[LOGIN] Argon2 mismatch! Wachtwoord komt niet overeen met hash.`);
            throw new UnauthorizedException('The given email and password do not match');
        }

        this.logger.log(`[LOGIN] Succesvolle login voor ${email}`);
        return this.signJwt(user);
    }

    async register(dto: RegisterUserRequestDto): Promise<{ user: any; token: string }> {
        const passwordHash = await this.hashPassword(dto.password);
        
        const role: string = dto.role || 
        (dto.email.endsWith('@admin.com') ? Role.ADMIN : Role.VIEWER);

        const [newUser] = await this.db.insert(users).values({
            orgId: dto.orgId, 
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            passwordHash,
            role: role, 
        }).returning();

        const token = await this.signJwt(newUser);

        return { user: newUser, token };
    }

    private async signJwt(user: any): Promise<string> {
        const payload = { 
            sub: user.id, 
            email: user.email, 
            role: user.role 
        };
        return this.jwtService.signAsync(payload);
    }
}