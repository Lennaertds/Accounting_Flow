// backend/src/config/config.interface.ts

import { LogLevel } from "@nestjs/common";

export interface DatabaseConfig {
    connection: string;
}

export interface ServerConfig {
    env: string;
    port: number;
    jwtSecret: string;
    database: DatabaseConfig;
    auth: AuthConfig;
    log: LogConfig;
}

export interface JwtConfig {
    expirationInterval: number;
    secret: string;
    audience: string;
    issuer: string;
}

export interface AuthConfig {
    hashLength: number;
    timeCost: number;
    memoryCost: number;
    jwt: JwtConfig;
    maxDelay: number;
}

export interface LogConfig {
    level: LogLevel;
    enabled: boolean;
}
