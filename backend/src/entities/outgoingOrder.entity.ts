// backend/src/entities/outgoingOrder.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { Organization } from './organization.entity';
import { Partner } from './partner.entity';
import { MatchP5P1 } from './match_P5_P1.entity';

@Entity('outgoing_orders')
export class OutgoingOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string; // [PK]

    @Column({ name: 'org_id' })
    orgId: string; // [FK]

    @Column({ name: 'supplier_id' })
    supplierId: string; // [FK] naar Partners

    @Column({ 
        type: 'varchar', 
        length: 20 
    })
    channel: 'EMAIL' | 'PEPPOL' | 'PLATFORM'; // Enum

    @Column({ 
        type: 'varchar', 
        length: 20,
        default: 'ORDERED'
    })
    status: 'ORDERED' | 'RECEIVED' | 'INVOICED'; // Enum

    // --- RELATIES ---

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    @ManyToOne(() => Partner)
    @JoinColumn({ name: 'supplier_id' })
    supplier: Partner;

    // Koppeling naar de automatisatie trigger voor aankoopfacturen
    @OneToMany(() => MatchP5P1, (match) => match.outgoingOrder)
    invoiceMatches: MatchP5P1[];
}