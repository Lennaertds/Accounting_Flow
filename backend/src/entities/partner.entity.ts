// backend/src/entities/partner.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { Organization } from './organization.entity';
import { IncomingInvoice } from './incomingInvoice.entity';
import { OutgoingInvoice } from './outgoingInvoice.entity';
import { IncomingOrder } from './incomingOrder.entity';
import { OutgoingOrder } from './outgoingOrder.entity';

@Entity('partners')
export class Partner {
    @PrimaryGeneratedColumn('uuid')
    id: string; // [PK]

    @Column({ name: 'org_id' })
    orgId: string; // [FK] naar Organizations

    @Column({ type: 'varchar', length: 255 })
    name: string; //

    @Column({ name: 'vat_nr', type: 'varchar', length: 50, nullable: true })
    vatNr: string; //

    @Column({ name: 'peppol_id', type: 'varchar', length: 100, nullable: true })
    peppolId: string; // Unieke identifier voor het Peppol-netwerk

    @Column({ name: 'preferred_order_channel', type: 'varchar', length: 50, nullable: true })
    preferredOrderChannel: string; // Bijv. 'PEPPOL', 'EMAIL'

    @Column({ name: 'preferred_invoice_channel', type: 'varchar', length: 50, nullable: true })
    preferredInvoiceChannel: string; // Bijv. 'PEPPOL', 'EMAIL'

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string; //

    @Column({ name: 'is_peppol_ready', type: 'boolean', default: false })
    isPeppolReady: boolean; //

    @Column({ name: 'is_customer', type: 'boolean', default: false })
    isCustomer: boolean; //

    @Column({ name: 'is_supplier', type: 'boolean', default: false })
    isSupplier: boolean; //

    @Column({ name: 'bank_account_iban', type: 'varchar', length: 34, nullable: true })
    bankAccountIban: string; // IBAN voor betalingen of matching

    // --- RELATIES ---

    @ManyToOne(() => Organization, (org) => org.partners)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    // Relaties met facturen en bestellingen
    @OneToMany(() => IncomingInvoice, (inv) => inv.supplier)
    incomingInvoices: IncomingInvoice[];

    @OneToMany(() => OutgoingInvoice, (inv) => inv.customer)
    outgoingInvoices: OutgoingInvoice[];

    @OneToMany(() => IncomingOrder, (order) => order.customer)
    incomingOrders: IncomingOrder[];

    @OneToMany(() => OutgoingOrder, (order) => order.supplier)
    outgoingOrders: OutgoingOrder[];
}