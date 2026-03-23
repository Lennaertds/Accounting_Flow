// backend/src/entities/incomingInvoice.entity.ts
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
import { MatchP5P1 } from './match_P5_P1.entity';

@Entity('incoming_invoices')
export class IncomingInvoice {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK]

    @Column({ name: 'org_id' })
    orgId: string; // [FK] naar Organizations

    @Column({ 
        type: 'varchar', 
        length: 20 
    })
    type: 'INVOICE' | 'CREDIT_NOTE'; // Enum conform ERD

    @Column({ name: 'supplier_id' })
    supplierId: string; // [FK] naar Partners

    @Column({ name: 'invoice_nr', type: 'varchar', length: 100 })
    invoiceNr: string; //

    @Column({ type: 'date' })
    date: Date; //

    @Column({ name: 'total_excl_vat', type: 'decimal', precision: 12, scale: 2 })
    totalExclVat: number; //

    @Column({ name: 'vat_code_id' })
    vatCodeId: string; // [FK] naar VatCodes

    @Column({ name: 'ocr_confidence', type: 'float', nullable: true })
    ocrConfidence: number; //

    @Column({ 
        type: 'varchar', 
        length: 20, 
        default: 'PENDING' 
    })
    status: 'PENDING' | 'MATCHED' | 'DISCREPANCY' | 'CANCELLED'; // Enum

    @Column({ name: 'is_peppol', type: 'boolean', default: false })
    isPeppol: boolean; //

    @Column({ name: 'raw_file_storage_path', type: 'varchar', length: 255, nullable: true })
    rawFileStoragePath: string; //

    // --- RELATIES ---

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    @ManyToOne(() => Partner)
    @JoinColumn({ name: 'supplier_id' })
    supplier: Partner;

    @ManyToOne(() => VatCode)
    @JoinColumn({ name: 'vat_code_id' })
    vatCode: VatCode;

    // Automatisatie Trigger: Match met OutgoingOrders (P5)
    @OneToMany(() => MatchP5P1, (match) => match.incomingInvoice)
    orderMatches: MatchP5P1[];
}