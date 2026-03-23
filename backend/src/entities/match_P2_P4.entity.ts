// backend/src/entities/match_P2_P4.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { IncomingOrder } from './incomingOrder.entity';
import { OutgoingInvoice } from './outgoingInvoice.entity';

@Entity('match_p2_p4')
export class MatchP2P4 {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ name: 'incoming_order_id' })
    incomingOrderId: string; // [FK] naar IncomingOrders

    @Column({ name: 'outgoing_invoice_id' })
    outgoingInvoiceId: string; // [FK] naar OutgoingInvoices

    // --- RELATIES ---

    @ManyToOne(() => IncomingOrder, (order) => order.invoiceMatches)
    @JoinColumn({ name: 'incoming_order_id' })
    incomingOrder: IncomingOrder;

    @ManyToOne(() => OutgoingInvoice, (invoice) => invoice.orderMatches)
    @JoinColumn({ name: 'outgoing_invoice_id' })
    outgoingInvoice: OutgoingInvoice;
}