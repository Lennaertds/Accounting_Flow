// backend/src/drizzle/seed-types.ts

import { UUID } from "crypto";

// --- Basis Management ---
export interface SeedOrganization {
    name: string;
    vat: string;
    iban: string;
}

export interface SeedUser {
    orgId: UUID;
    firstName: string;
    lastName: string;
    email: string;
    password?: string; 
    role: string;
}

// --- Stamdata (Dimensions) ---
export interface SeedVatCode {
    code: string;
    rate: string;
    description: string;
    taxDeclarationBox: number;
}

export interface SeedPartner {
    name: string;
    orgId: UUID;
    isCustomer: boolean;
    isSupplier: boolean;
    vat?: string;
    peppolId?: string;
    preferredOrderChannel: 'PEPPOL' | 'EMAIL' | 'PLATFORM';
    preferredInvoiceChannel: 'PEPPOL' | 'EMAIL';
}

export interface SeedAnalyticAccount {
    name: string;
    code: string;
    orgName: string;
}

// --- Pilaar 3: Het Grootboek ---
export interface SeedLedgerAccount {
    code: number;
    name: string;
    category: 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE';
}

export interface SeedJournal {
    name: string;
    type: 'PURCHASE' | 'SALE' | 'BANK' | 'CASH' | 'GENERAL'; 
    code: string;
    orgName: string;
}

// --- Pilaren 1, 2, 4, 5: Documenten ---
export interface SeedInvoice {
    orgName: string;
    partnerName: string;
    invoiceNr: string;
    date: string;
    totalExclVat: number;
    vatCode: string;
    status: string;
    isPeppol: boolean;
}

export interface SeedOrder {
    orgName: string;
    partnerName: string;
    sourceOrChannel: string;
    totalEstimated: number;
    status: string;
}