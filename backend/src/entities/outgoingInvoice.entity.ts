// backend/src/entities/outgoingInvoice.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Organization } from './organization.entity';
import { Partner } from './partner.entity';
import { VatCode } from './vatCode.entity';
import { FollowUpLog } from './followUpLog.entity';
import { MatchP2P4 } from './match_P2_P4.entity';

@Entity('outgoing_invoices')
export class OutgoingInvoice {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ name: 'org_id' })
    orgId: string; // [FK] naar Organizations

    @Column({ 
        type: 'varchar', 
        length: 20 
    })
    type: 'INVOICE' | 'CREDIT_NOTE'; // Enum conform ERD

    @Column({ name: 'customer_id' })
    customerId: string; // [FK] naar Partners (Klanten)

    @Column({ name: 'invoice_nr', type: 'varchar', length: 100 })
    invoiceNr: string; // Factuurnummer

    @Column({ name: 'vat_code_id' })
    vatCodeId: string; // [FK] naar VatCodes

    @Column({ 
        name: 'peppol_status',
        type: 'varchar', 
        length: 20, 
        default: 'DRAFT' 
    })
    peppolStatus: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'; // Enum conform ERD

    @Column({ name: 'raw_file_storage_path', type: 'varchar', length: 255, nullable: true })
    rawFileStoragePath: string; // Pad naar de gegenereerde PDF/XML

    // --- RELATIES ---

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    @ManyToOne(() => Partner)
    @JoinColumn({ name: 'customer_id' })
    customer: Partner;

    @ManyToOne(() => VatCode)
    @JoinColumn({ name: 'vat_code_id' })
    vatCode: VatCode;

    // Relatie naar Pilaar 4: Opvolging/Reminders
    @OneToMany(() => FollowUpLog, (follow) => follow.invoice)
    followUps: FollowUpLog[];

    // Automatisatie Trigger: Match met IncomingOrders (P2)
    @OneToMany(() => MatchP2P4, (match) => match.outgoingInvoice)
    orderMatches: MatchP2P4[];
}