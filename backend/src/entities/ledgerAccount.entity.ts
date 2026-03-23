// backend/src/entities/ledgerAccount.entity.ts
import { 
  Entity, 
  PrimaryColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { Organization } from './organization.entity';
import { Transaction } from './transaction.entity';
import { Budget } from './budget.entity';

@Entity('ledger_accounts')
export class LedgerAccount {
    @PrimaryColumn({ type: 'integer' })
    code: number; // Integer [PK] conform ERD (bijv. 600000, 700000)

    @Column({ name: 'org_id' })
    orgId: string; // [FK] naar Organizations

    @Column({ type: 'varchar', length: 255 })
    name: string; // Naam van de rekening (bijv. 'Handelsgoederen')

    @Column({ 
        type: 'varchar', 
        length: 20 
    })
    category: 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE'; // Enum conform ERD

    // --- RELATIES ---

    // Relatie N:1 met Organization
    @ManyToOne(() => Organization, (org) => org.ledgerAccounts)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    // Relatie 1:N met Transactions (De individuele boekingslijnen op deze rekening)
    @OneToMany(() => Transaction, (transaction) => transaction.ledgerAccount)
    transactions: Transaction[];

    // Relatie 1:N met Budgets (Budgettering per grootboekrekening)
    @OneToMany(() => Budget, (budget) => budget.ledgerAccount)
    budgets: Budget[];
}