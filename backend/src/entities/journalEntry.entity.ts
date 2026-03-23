// backend/src/entities/journalEntry.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { Journal } from './journal.entity';
import { Transaction } from './transaction.entity';
import { Asset } from './asset.entity';
import { ReconciliationLog } from './reconciliationLog.entity';

@Entity('journal_entries')
export class JournalEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ name: 'journal_id' })
    journalId: string; // [FK] naar Journals

    @Column({ type: 'date' })
    date: Date; // Boekdatum

    @Column({ type: 'text', nullable: true })
    description: string; // Omschrijving van de boeking

    // --- RELATIES ---

    @ManyToOne(() => Journal, (journal) => journal.entries)
    @JoinColumn({ name: 'journal_id' })
    journal: Journal;

    // Relatie 1:N met Transactions (De individuele debet/credit lijnen)
    @OneToMany(() => Transaction, (transaction) => transaction.entry)
    transactions: Transaction[];

    // Relatie 1:1 of 1:N met Assets (Een aankoopboeking kan een asset creëren)
    @OneToMany(() => Asset, (asset) => asset.purchaseEntry)
    assets: Asset[];

    // Relatie voor aflettering (Reconciliation)
    @OneToMany(() => ReconciliationLog, (recon) => recon.journalEntry)
    reconciliations: ReconciliationLog[];
}