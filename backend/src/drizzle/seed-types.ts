// backend/src/drizzle/seed-types.ts

import { UUID } from "crypto";

// ==========================================
// THEMA 0: FOUNDATION & AUTH (Organisatie & Gebruikers)
// ==========================================
export interface SeedOrganization {
    seedKey: string;
    name: string;
    vat?: string;
    iban?: string;
}
export type SeedOrganizations = SeedOrganization[];

export interface SeedUser {
    orgSeedKey: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'ACCOUNTANT' | 'USER' | 'VIEWER';
}
export type SeedUsers = SeedUser[];

// ==========================================
// THEMA 1: STAMGEGEVENS (Dimensions)
// ==========================================
export interface SeedPartner {
    orgSeedKey: string;
    name: string;
    isCustomer: boolean;
    isSupplier: boolean;
    vat?: string;
    peppolId?: string;
    email?: string;
    isPeppolReady: boolean;
    preferredOrderChannel: 'EMAIL' | 'PEPPOL' | 'PLATFORM';
    preferredInvoiceChannel: 'EMAIL' | 'PEPPOL' | 'PLATFORM';
    bankAccountIban?: string;
}
export type SeedPartners = SeedPartner[];

export interface SeedProduct {
    orgSeedKey: string;
    sku: string;
    name: string;
    unit: string;
    active: boolean;
}
export type SeedProducts = SeedProduct[];

export interface SeedVatCode {
    orgSeedKey: string;
    code: string;
    rate: string; 
    description: string;
    taxDeclarationBox: number;
}
export type SeedVatCodes = SeedVatCode[];

export interface SeedAnalyticAccount {
    orgSeedKey: string;
    name: string;
    code: string;
    active: boolean;
}
export type SeedAnalyticAccounts = SeedAnalyticAccount[];

// ==========================================
// THEMA 2: BANKING & RECONCILIATION
// ==========================================
export interface SeedBankStatement {
    orgSeedKey: string;
    date: string;
    amount: string;
    communication?: string;
    counterpartyIban?: string;
    bankReference: string;
}
export type SeedBankStatements = SeedBankStatement[];

export interface SeedSepaExport {
    orgSeedKey: string;
    createdByEmail: string;
    filename: string;
    executionDate: string;
    status: 'GENERATED' | 'UPLOADED' | 'PROCESSED';
}
export type SeedSepaExports = SeedSepaExport[];

// ==========================================
// THEMA 3: INKOOP & VOORRAAD (Pilaar 1, 3 & 5)
// ==========================================
export interface SeedQuotation {
    orgSeedKey: string;
    partnerName: string;
    quotationNr: string;
    version: number;
    status: 'DRAFT' | 'SENT' | 'SIGNED' | 'EXPIRED' | 'CONVERTED';
    totalAmount: string;
}
export type SeedQuotations = SeedQuotation[];

export interface SeedOutgoingOrder {
    orgSeedKey: string;
    supplierName: string;
    orderNr: string;
    date: string;
    totalEstimated: string;
    channel: 'EMAIL' | 'PEPPOL' | 'PLATFORM';
    status: 'ORDERED' | 'RECEIVED' | 'INVOICED';
    lines: SeedOutgoingOrderLine[];
}
export type SeedOutgoingOrders = SeedOutgoingOrder[];

export interface SeedOutgoingOrderLine {
    productSku: string;
    description: string;
    quantity: string;
    unitPrice: string;
    vatCode: string;
}

export interface SeedGoodsReceipt {
    orgSeedKey: string;
    orderNr: string; 
    receivedByEmail: string;
    deliveryNoteRef: string;
    lines: {
        productSku: string;
        quantityReceived: string;
        condition: 'GOOD' | 'DAMAGED' | 'MISSING';
    }[];
}
export type SeedGoodsReceipts = SeedGoodsReceipt[];

export interface SeedGoodsReceiptLine {
    productSku: string;
    quantityReceived: string;
    condition: 'GOOD' | 'DAMAGED' | 'MISSING';
}

export interface SeedIncomingInvoice {
    orgSeedKey: string;
    supplierName: string;
    invoiceNr: string;
    date: string;
    dueDate?: string;
    totalExclVat: string;
    vatCode: string;
    status: 'PENDING' | 'MATCHED' | 'DISCREPANCY';
    isPeppol: boolean;
    ocrConfidence?: string;
    lines: SeedIncomingInvoiceLine[];
}
export type SeedIncomingInvoices = SeedIncomingInvoice[];

export interface SeedIncomingInvoiceLine {
    productSku?: string;        
    description: string;
    quantity: string;
    unitPrice: string;
    vatCode: string;             
    ledgerAccountCode?: number;  
}

export interface SeedInventoryMutation {
    orgSeedKey: string;
    productSku: string;          
    change: string;              
    valuation: string;          
    sourceType: 'GOODS_RECEIPT' | 'PURCHASE_INVOICE' | 'MANUAL';
    sourceReference: string;   
}
export type SeedInventoryMutations = SeedInventoryMutation[];

// ==========================================
// THEMA 4: VERKOOP (Pilaar 2 & 4)
// ==========================================
export interface SeedIncomingOrder {
    orgSeedKey: string;
    customerName: string;
    orderNr?: string;
    date: string; 
    source: 'PLATFORM' | 'PEPPOL' | 'EMAIL_AI';
    referenceExt: string;
    totalEstimated: string;
    status: 'RECEIVED' | 'CONFIRMED' | 'REJECTED';
    aiSummary?: string;
    lines: SeedIncomingOrderLine[]; 
}
export type SeedIncomingOrders = SeedIncomingOrder[];

export interface SeedIncomingOrderLine {
    productSku?: string;        
    description: string;
    quantity: string;
    unitPrice: string;
    vatCode: string;            
}

export interface SeedOutgoingInvoice {
    orgSeedKey: string;
    customerName: string;
    invoiceNr: string;
    date: string;
    dueDate?: string;
    totalExclVat: string; 
    vatCode: string;
    status: 'PAID' | 'DRAFT' | 'SENT'
    peppolStatus: 'DELIVERED' | 'NONE' | 'PAID' | 'OVERDUE'; 
    rawFileStoragePath?: string; 
    lines: SeedOutgoingInvoiceLine[];
}
export type SeedOutgoingInvoices = SeedOutgoingInvoice[];

export interface SeedOutgoingInvoiceLine {
    productSku?: string;        
    description: string;
    quantity: string;
    unitPrice: string;
    vatCode: string;             
    ledgerAccountCode?: number;  
}

// ==========================================
// THEMA 5: ACCOUNTING & MATCHING
// ==========================================
export interface SeedJournalEntry {
    orgSeedKey: string;
    journalCode: string;
    date: string;       
    description: string;
}
export type SeedJournalEntries = SeedJournalEntry[];

export interface SeedTransaction {
    orgSeedKey: string;
    entryDescription: string; 
    ledgerCode: number;      
    analyticCode?: string;  
    amount: string;        
    isReconciled: boolean;
}
export type SeedTransactions = SeedTransaction[];

export interface SeedReconciliationLog {
    orgSeedKey: string;
    bankReference: string;           
    journalEntryDescription: string; 
    ledgerCode: number;             
    matchType: 'MANUAL' | 'AUTO' | 'AI_SUGGESTED';
}
export type SeedReconciliationLogs = SeedReconciliationLog[];

export interface SeedJournal {
    orgSeedKey: string;
    name: string;
    type: 'AANKOOP' | 'VERKOOP' | 'BANK' | 'DIVERSEN'; 
    code: string;
}
export type SeedJournals = SeedJournal[];

export interface SeedLedgerAccount {
    orgSeedKey: string;
    code: number;
    name: string;
    category: 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE' | 'EQUITY';
}
export type SeedLedgerAccounts = SeedLedgerAccount[];

export interface SeedAsset {
    orgSeedKey: string;
    name: string;                
    purchaseEntryDescription: string; 
    totalValue: string;         
    depreciationMonths: number; 
    startDate: string;         
}
export type SeedAssets = SeedAsset[];

export interface SeedBudget {
    orgSeedKey: string;
    ledgerCode: number;       
    analyticCode?: string;   
    amountLimit: string;   
    period: string;     
}
export type SeedBudgets = SeedBudget[];

// ==========================================
// THEMA 6: GOVERNANCE & LOGS
// ==========================================
export interface SeedAccountingPeriod {
    orgSeedKey: string;
    name: string;
    startDate: string;
    endDate: string;
    isLocked: boolean;
}
export type SeedAccountingPeriods = SeedAccountingPeriod[];

export interface SeedAuditLog {
    orgSeedKey: string;
    userEmail: string;      
    action: string;         
    entityType: string;     
    entityReference: string;
    changes?: any;          
}
export type SeedAuditLogs = SeedAuditLog[];

export interface SeedFollowUpLog {
    orgSeedKey: string;
    userEmail: string;
    actionTaken: string;
    statusAfterAction: string;
}
export type SeedFollowUpLogs = SeedFollowUpLog[];

export interface SeedInteractionLog {
    orgSeedKey: string;
    partnerName: string;     
    userEmail?: string;      
    entityType?: 'INVOICE' | 'ORDER' | 'QUOTATION';
    entityReference?: string; 
    type: 'EMAIL' | 'PHONE' | 'SYSTEM_ALERT';
    message: string;
}
export type SeedInteractionLogs = SeedInteractionLog[];

export interface SeedInvoiceDispute {
    orgSeedKey: string;
    invoiceNr: string;      
    isIncoming: boolean;    
    reason: string;
    status: 'OPEN' | 'RESOLVED' | 'CANCELLED';
}
export type SeedInvoiceDisputes = SeedInvoiceDispute[];

export interface SeedUserDashboardConfig {
    userEmail: string;      
    layout: any;           
    theme: 'glassmorphism' | 'light' | 'dark';
}
export type SeedUserDashboardConfigs = SeedUserDashboardConfig[];