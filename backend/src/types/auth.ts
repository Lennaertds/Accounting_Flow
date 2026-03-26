// backend/src/types/auth.ts

export interface JwtPayload {
    sub: string;   
    email: string;
    role: string; 
    orgId: string; 
}

export interface Session {
    userId: string;
    email: string;
    role: string;
    orgId: string; 
}