// backend/src/entities/match_P5_P1.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { OutgoingOrder } from './outgoingOrder.entity';
import { IncomingInvoice } from './incomingInvoice.entity';

@Entity('match_p5_p1')
export class MatchP5P1 {
    @PrimaryGeneratedColumn('uuid')
    id: string; // UUID [PK] conform ERD

    @Column({ name: 'outgoing_order_id' })
    outgoingOrderId: string; // [FK] naar OutgoingOrders

    @Column({ name: 'incoming_invoice_id' })
    incomingInvoiceId: string; // [FK] naar IncomingInvoices

    // --- RELATIES ---

    @ManyToOne(() => OutgoingOrder, (order) => order.invoiceMatches)
    @JoinColumn({ name: 'outgoing_order_id' })
    outgoingOrder: OutgoingOrder;

    @ManyToOne(() => IncomingInvoice, (invoice) => invoice.orderMatches)
    @JoinColumn({ name: 'incoming_invoice_id' })
    incomingInvoice: IncomingInvoice;
}