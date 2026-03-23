// backend/src/entities/journal.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { Organization } from './organization.entity';
import { JournalEntry } from './journalEntry.entity';

@Entity('journals')
export class Journal {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ name: 'org_id' })
    orgId: string; // [FK] naar Organizations

    @Column({ type: 'varchar', length: 255 })
    name: string; // Bijv. 'Aankoopboek', 'Bank-ING'

    @Column({ 
        type: 'varchar', 
        length: 20 
    })
    type: 'AANKOOP' | 'VERKOOP' | 'BANK' | 'DIVERS'; // Enum conform ERD

    @Column({ type: 'varchar', length: 10 })
    code: string; // Bijv. 'ACK', 'VK'

    // --- RELATIES ---

    @ManyToOne(() => Organization, (org) => org.journals)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    // Relatie 1:N met JournalEntries (Een dagboek bevat vele boekingen)
    @OneToMany(() => JournalEntry, (entry) => entry.journal)
    entries: JournalEntry[];
}