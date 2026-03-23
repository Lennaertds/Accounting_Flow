// backend/src/entities/user.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  UpdateDateColumn
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string; //

    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash: string; // Gehasht wachtwoord

    @Column({ 
        type: 'varchar', 
        length: 20,
        default: 'VIEWER'
    })
    role: 'ADMIN' | 'ACCOUNTANT' | 'VIEWER'; // Enum conform ERD

    @Column({ name: 'last_login', type: 'timestamp', nullable: true })
    lastLogin: Date; // Timestamp conform ERD

    @Column({ name: 'org_id' })
    orgId: string; // [FK] naar Organizations

    // --- RELATIES ---

    // Elke gebruiker behoort tot één organisatie (Multi-tenant)
    @ManyToOne(() => Organization, (org) => org.users)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;
}