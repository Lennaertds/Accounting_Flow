// backend/src/entities/followUpLog.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { OutgoingInvoice } from './outgoingInvoice.entity';

@Entity('follow_up_log')
export class FollowUpLog {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ name: 'invoice_id' })
    invoiceId: string; // Foreign Key naar OutgoingInvoices

    @Column({ name: 'sent_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    sentAt: Date; // Tijdstip van verzending

    @Column({ 
        type: 'varchar', 
        length: 20 
    })
    type: 'REMINDER_1' | 'REMINDER_2'; // Enum conform ERD

    // --- RELATIES ---

    // Relatie N:1 met OutgoingInvoice (Pilaar 4)
    @ManyToOne(() => OutgoingInvoice, (invoice) => invoice.followUps)
    @JoinColumn({ name: 'invoice_id' })
    invoice: OutgoingInvoice;
}