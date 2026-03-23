// backend/src/entities/analyticAccount.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { Organization } from './organization.entity';
import { Transaction } from './transaction.entity';
import { Budget } from './budget.entity';

@Entity('analytic_accounts')
export class AnalyticAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'org_id' })
    orgId: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 50 })
    code: string;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    // --- RELATIES ---

    // Relatie N:1 met Organization (Elke analytic account hoort bij één organisatie)
    @ManyToOne(() => Organization, (org) => org.analyticAccounts)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    // Relatie 1:N met Transactions (Pilaar 3: Het Grootboek)
    @OneToMany(() => Transaction, (transaction) => transaction.analyticAccount)
    transactions: Transaction[];

    // Relatie 1:N met Budgets (Pilaar 3: Het Grootboek)
    @OneToMany(() => Budget, (budget) => budget.analyticAccount)
    budgets: Budget[];
}