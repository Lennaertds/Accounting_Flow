// backend/src/entities/transaction.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { JournalEntry } from './journalEntry.entity';
import { LedgerAccount } from './ledgerAccount.entity';
import { AnalyticAccount } from './analyticAccount.entity';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ name: 'entry_id' })
    entryId: string; // [FK] naar JournalEntries

    @Column({ name: 'ledger_code' })
    ledgerCode: number; // [FK] naar LedgerAccounts (Integer PK)

    @Column({ name: 'analytic_account_id', nullable: true })
    analyticAccountId: string; // [FK] naar AnalyticAccounts (Optioneel)

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number; // Positief is Debet, Negatief is Credit (of vice versa afhankelijk van logica)

    @Column({ name: 'is_reconciled', type: 'boolean', default: false })
    isReconciled: boolean; // Of deze lijn al gematcht is met de bank

    // --- RELATIES ---

    // De overkoepelende boeking waar deze lijn bij hoort
    @ManyToOne(() => JournalEntry, (entry) => entry.transactions)
    @JoinColumn({ name: 'entry_id' })
    entry: JournalEntry;

    // De grootboekrekening (bijv. 600000 Aankopen)
    @ManyToOne(() => LedgerAccount, (ledger) => ledger.transactions)
    @JoinColumn({ name: 'ledger_code' })
    ledgerAccount: LedgerAccount;

    // De analytische kostenplaats (bijv. 'Marketing' of 'Project X')
    @ManyToOne(() => AnalyticAccount, (analytic) => analytic.transactions)
    @JoinColumn({ name: 'analytic_account_id' })
    analyticAccount: AnalyticAccount;
}