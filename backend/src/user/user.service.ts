// backend/src/accounting/user.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import { RegisterUserRequestDto, UpdateUserRequestDto } from './user.dto';

@Injectable()
export class UserService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async register(dto: RegisterUserRequestDto) {
        const { password, ...userData } = dto;
        const passwordHash = await argon2.hash(password);

        try {
            const [newUser] = await this.db.insert(users)
                .values({
                    ...userData,
                    passwordHash,
                    role: dto.role || 'VIEWER'
                })
                .returning();

            const { passwordHash: _, ...result } = newUser;
            return result;
        } catch (e: any) {
            if (e.code === '23505') throw new ConflictException('Email adres bestaat al');
            throw e;
        }
    }

    async findAll() {
        return await this.db.select({
            id: users.id,
            orgId: users.orgId,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            role: users.role,
            lastLogin: users.lastLogin
        }).from(users);
    }

    async findById(id: string) {
        const result = await this.db.select().from(users).where(eq(users.id, id));
        if (!result.length) throw new NotFoundException(`User met ID ${id} niet gevonden`);
        
        const { passwordHash: _, ...userWithoutPassword } = result[0];
        return userWithoutPassword;
    }

    async updateById(id: string, dto: UpdateUserRequestDto) {
        try {
            const [updated] = await this.db.update(users)
                .set(dto)
                .where(eq(users.id, id))
                .returning();
            
            if (!updated) throw new NotFoundException('User niet gevonden');
            const { passwordHash: _, ...result } = updated;
            return result;
        } catch (e: any) {
            if (e.code === '23505') throw new ConflictException('Email al in gebruik');
            throw e;
        }
    }

    async deleteById(id: string) {
        const result = await this.db.delete(users).where(eq(users.id, id)).returning();
        if (!result.length) throw new NotFoundException('User niet gevonden');
    }
}