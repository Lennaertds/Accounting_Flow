// backend/src/drizzle/seed-types.ts

import { UUID } from "crypto";

// ==========================================
// THEMA 1: CORE & AUTH (Basis Management)
// ==========================================
export interface SeedOrganization {
    seedKey: string;
    name: string;
    vat?: string;
    iban?: string;
}

export interface SeedUser {
    orgSeedKey: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'ACCOUNTANT' | 'USER' | 'VIEWER';
}

// ==========================================
// THEMA 2: DIMENSIONS (Shared Stamdata)
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

export interface SeedVatCode {
    orgSeedKey: string;
    code: string;
    rate: string; 
    description: string;
    taxDeclarationBox: number;
}

export interface SeedAnalyticAccount {
    orgSeedKey: string;
    name: string;
    code: string;
    active: boolean;
}

// ==========================================
// THEMA 3: PILAAR 3 (Het Grootboek / Ledger)
// ==========================================
export interface SeedJournal {
    orgSeedKey: string;
    name: string;
    type: 'AANKOOP' | 'VERKOOP' | 'BANK' | 'DIVERSEN'; 
    code: string;
}

export interface SeedLedgerAccount {
    orgSeedKey: string;
    code: number;
    name: string;
    category: 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE' | 'EQUITY';
}

export interface SeedJournalEntry {
    orgSeedKey: string;
    journalCode: string;
    date: string;       
    description: string;
}

export interface SeedTransaction {
    orgSeedKey: string;
    entryDescription: string; 
    ledgerCode: number;      
    analyticCode?: string;  
    amount: string;        
    isReconciled: boolean;
}

export interface SeedAsset {
    orgSeedKey: string;
    name: string;                
    purchaseEntryDescription: string; 
    totalValue: string;         
    depreciationMonths: number; 
    startDate: string;         
}

export interface SeedBudget {
    orgSeedKey: string;
    ledgerCode: number;       
    analyticCode?: string;   
    amountLimit: string;   
    period: string;     
}

// ==========================================
// THEMA 4: PILAREN 1, 2, 4, 5 (Documenten/Matching)
// ==========================================

// --- Invoices (Pilaar 1 & 4) ---
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
}

export interface SeedOutgoingInvoice {
    orgSeedKey: string;
    customerName: string;
    invoiceNr: string;
    date: string;
    dueDate?: string;
    totalExclVat: string; 
    vatCode: string;
    peppolStatus: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'; 
    rawFileStoragePath?: string; 
}

// --- Orders (Pilaar 2 & 5) ---
export interface SeedIncomingOrder {
    orgSeedKey: string;
    customerName: string;
    orderNr?: string;
    date: string; // "2026-03-29"
    source: 'PLATFORM' | 'PEPPOL' | 'EMAIL_AI';
    referenceExt: string;
    totalEstimated: string;
    status: 'RECEIVED' | 'CONFIRMED' | 'REJECTED';
}

export interface SeedOutgoingOrder {
    orgSeedKey: string;
    supplierName: string;
    orderNr: string;
    date: string; // "2026-03-29"
    totalEstimated: string;
    channel: 'EMAIL' | 'PEPPOL' | 'PLATFORM';
    status: 'ORDERED' | 'RECEIVED' | 'INVOICED';
}

// ==========================================
// THEMA 5: BANKING & RECONCILIATION
// ==========================================
export interface SeedBankStatement {
    orgSeedKey: string;
    date: string;
    amount: string;
    communication?: string;
    counterpartyIban?: string;
    bankReference: string;
}

// ==========================================
// THEMA 6: MATCHING
// ==========================================
export interface SeedFollowUpLogs {
    orgSeedKey: string;
    userEmail: string;
    actionTaken: string;
    statusAfterAction: string;
}