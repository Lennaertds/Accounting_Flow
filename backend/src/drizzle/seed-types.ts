// backend/src/drizzle/seed-types.ts
// --- Basis Management ---
export interface SeedOrganization {
    name: string;
    vat: string;
    iban: string;
}

export interface SeedUser {
    email: string;
    password?: string; 
    orgName: string; 
    role: 'ADMIN' | 'ACCOUNTANT' | 'VIEWER';
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
    orgName: string;
    isCustomer: boolean;
    isSupplier: boolean;
    vatNr?: string;
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
    type: 'AANKOOP' | 'VERKOOP' | 'BANK' | 'DIVERS';
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