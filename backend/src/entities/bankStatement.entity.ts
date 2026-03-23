// backend/src/entities/bankStatement.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { Organization } from './organization.entity';
import { ReconciliationLog } from './reconciliationLog.entity';

@Entity('bank_statements')
export class BankStatement {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ name: 'org_id' })
    orgId: string; // Foreign Key naar Organizations

    @Column({ type: 'date' })
    date: Date; // De datum van de bankverrichting

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number; // Het bedrag van de transactie

    @Column({ type: 'text', nullable: true })
    communication: string; // Mededeling/Omschrijving van de bank

    @Column({ name: 'counterparty_iban', type: 'varchar', length: 34, nullable: true })
    counterpartyIban: string; // IBAN van de tegenpartij

    // --- RELATIES ---

    // Relatie N:1 met Organization
    @ManyToOne(() => Organization, (org) => org.bankStatements)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    // Relatie 1:N met ReconciliationLog (Een banklijn kan aan meerdere posten gekoppeld worden)
    @OneToMany(() => ReconciliationLog, (recon) => recon.bankStatement)
    reconciliations: ReconciliationLog[];
}