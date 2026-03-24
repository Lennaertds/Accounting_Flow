// backend/src/accounting/organization.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle, DatabaseProvider } from '../drizzle/drizzle.provider';
import { organizations } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateOrganizationDto } from './organization.dto';

@Injectable()
export class OrganizationService {
    constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

    async findAll() {
        return await this.db.select().from(organizations);
    }

    async findOne(id: string) {
        const result = await this.db.select().from(organizations).where(eq(organizations.id, id));
        if (!result.length) throw new NotFoundException('Organisatie niet gevonden');
        return result[0];
    }

    async create(dto: CreateOrganizationDto) {
        const result = await this.db.insert(organizations).values(dto).returning();
        return result[0];
    }
}