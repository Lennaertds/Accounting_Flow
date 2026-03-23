// backend/src/entities/organization.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  OneToMany 
} from 'typeorm';
import { User } from './user.entity';
import { Partner } from './partner.entity';
import { AnalyticAccount } from './analyticAccount.entity';
import { IncomingInvoice } from './incomingInvoice.entity';
import { OutgoingInvoice } from './outgoingInvoice.entity';
import { IncomingOrder } from './incomingOrder.entity';
import { OutgoingOrder } from './outgoingOrder.entity';
import { Journal } from './journal.entity';
import { BankStatement } from './bankStatement.entity';
import { LedgerAccount } from './ledgerAccount.entity';

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ type: 'varchar', length: 255 })
    name: string; //

    @Column({ name: 'my_vat_nr', type: 'varchar', length: 50 })
    myVatNr: string; //

    @Column({ name: 'my_iban', type: 'varchar', length: 34 })
    myIban: string; //

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date; //

    // --- RELATIES (Inverse sides voor bi-directionele toegang) ---

    @OneToMany(() => User, (user) => user.organization)
    users: User[]; //

    @OneToMany(() => Partner, (partner) => partner.organization)
    partners: Partner[]; //

    @OneToMany(() => AnalyticAccount, (analytic) => analytic.organization)
    analyticAccounts: AnalyticAccount[]; //

    @OneToMany(() => IncomingInvoice, (inv) => inv.organization)
    incomingInvoices: IncomingInvoice[]; //

    @OneToMany(() => OutgoingInvoice, (inv) => inv.organization)
    outgoingInvoices: OutgoingInvoice[]; //

    @OneToMany(() => IncomingOrder, (order) => order.organization)
    incomingOrders: IncomingOrder[]; //

    @OneToMany(() => OutgoingOrder, (order) => order.organization)
    outgoingOrders: OutgoingOrder[]; //

    @OneToMany(() => Journal, (journal) => journal.organization)
    journals: Journal[]; //

    @OneToMany(() => BankStatement, (bank) => bank.organization)
    bankStatements: BankStatement[]; //

    @OneToMany(() => LedgerAccount, (ledger) => ledger.organization)
    ledgerAccounts: LedgerAccount[]; //
}