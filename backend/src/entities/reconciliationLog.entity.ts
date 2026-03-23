// backend/src/entities/reconciliationLog.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { BankStatement } from './bankStatement.entity';
import { JournalEntry } from './journalEntry.entity';

@Entity('reconciliation_log')
export class ReconciliationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ name: 'bank_statement_id' })
    bankStatementId: string; // [FK] naar BankStatements

    @Column({ name: 'journal_entry_id' })
    journalEntryId: string; // [FK] naar JournalEntries

    @Column({ 
        name: 'match_type',
        type: 'varchar', 
        length: 20,
        default: 'AUTO'
    })
    matchType: 'AUTO' | 'MANUAL'; // Enum conform ERD

    // --- RELATIES ---

    // Koppeling met de banktransactie
    @ManyToOne(() => BankStatement, (bank) => bank.reconciliations)
    @JoinColumn({ name: 'bank_statement_id' })
    bankStatement: BankStatement;

    // Koppeling met de boekhoudkundige boeking
    @ManyToOne(() => JournalEntry, (entry) => entry.reconciliations)
    @JoinColumn({ name: 'journal_entry_id' })
    journalEntry: JournalEntry;
}