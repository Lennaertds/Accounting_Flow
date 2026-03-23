// backend/src/types/auth.ts

export interface JwtPayload {
    sub: string;   
    email: string;
    roles: string[]; 
    orgId: string; 
}

export interface Session {
    userId: string;
    email: string;
    roles: string[];
    orgId: string; 
}