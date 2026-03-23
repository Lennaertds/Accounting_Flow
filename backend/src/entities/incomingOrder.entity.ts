// backend/src/entities/incomingOrder.entity.ts
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
import { MatchP2P4 } from './match_P2_P4.entity';

@Entity('incoming_orders')
export class IncomingOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string; // [PK]

    @Column({ name: 'org_id' })
    orgId: string; // [FK]

    @Column({ name: 'customer_id' })
    customerId: string; // [FK] naar Partners

    @Column({ 
        type: 'varchar', 
        length: 20 
    })
    source: 'PLATFORM' | 'PEPPOL' | 'EMAIL_AI'; // Enum

    @Column({ name: 'reference_ext', type: 'varchar', length: 100, nullable: true })
    referenceExt: string; //

    @Column({ name: 'total_estimated', type: 'decimal', precision: 12, scale: 2 })
    totalEstimated: number; //

    @Column({ name: 'raw_input_path', type: 'text', nullable: true })
    rawInputPath: string; //

    @Column({ name: 'ai_summary', type: 'text', nullable: true })
    aiSummary: string; //

    // --- RELATIES ---

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'org_id' })
    organization: Organization;

    @ManyToOne(() => Partner)
    @JoinColumn({ name: 'customer_id' })
    customer: Partner;

    // Koppeling naar de automatisatie trigger voor verkoopfacturen
    @OneToMany(() => MatchP2P4, (match) => match.incomingOrder)
    invoiceMatches: MatchP2P4[];
}