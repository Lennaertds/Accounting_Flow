// backend/src/entities/vatCode.entity.ts
import { 
  Entity, 
  PrimaryColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { Organization } from './organization.entity';
import { IncomingInvoice } from './incomingInvoice.entity';
import { OutgoingInvoice } from './outgoingInvoice.entity';

@Entity('vat_codes')
export class VatCode {
    @PrimaryColumn({ type: 'varchar', length: 10 })
    code: string; // String [PK] bijv. 'BE-21', 'BE-0' conform ERD

    @Column({ name: 'org_id' })
    orgId: string; // [FK] naar Organizations

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    rate: number; // Het percentage (bijv. 21.00 of 6.00)

    @Column({ type: 'varchar', length: 255 })
    description: string; // Omschrijving (bijv. 'BTW 21% Verkoop')

    @Column({ name: 'tax_declaration_box', type: 'integer' })
    taxDeclarationBox: number; // Het vak op de BTW-aangifte (bijv. 03, 54, 81)

    // --- RELATIES ---

    // Elke organisatie kan haar eigen BTW-codes beheren (multi-tenant)
    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    // Relatie met inkomende facturen (Pilaar 1)
    @OneToMany(() => IncomingInvoice, (inv) => inv.vatCode)
    incomingInvoices: IncomingInvoice[];

    // Relatie met uitgaande facturen (Pilaar 4)
    @OneToMany(() => OutgoingInvoice, (inv) => inv.vatCode)
    outgoingInvoices: OutgoingInvoice[];
}