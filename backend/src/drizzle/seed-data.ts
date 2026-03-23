// backend/src/drizzle/seed-data.ts
import { 
    SeedOrganization, SeedUser, SeedVatCode, SeedPartner, 
    SeedLedgerAccount, SeedJournal, SeedAnalyticAccount 
} from './seed-types';

export const SEED_ORGANIZATIONS: SeedOrganization[] = [
    { name: 'Alpha Tech BV', vat: 'BE0123456789', iban: 'BE68123456789012' },
    { name: 'Beta Solutions NV', vat: 'BE0987654321', iban: 'BE68987654321098' }
];

export const SEED_USERS: SeedUser[] = [
    { email: 'admin@alpha.be', orgName: 'Alpha Tech BV', role: 'ADMIN' },
    { email: 'accountant@alpha.be', orgName: 'Alpha Tech BV', role: 'ACCOUNTANT' },
    { email: 'boss@beta.be', orgName: 'Beta Solutions NV', role: 'ADMIN' }
];

export const SEED_VAT_CODES: SeedVatCode[] = [
    { code: 'BE21', rate: '21.00', description: 'Standaard 21%', taxDeclarationBox: 1 },
    { code: 'BE12', rate: '12.00', description: 'Verlaagd 12%', taxDeclarationBox: 2 },
    { code: 'BE06', rate: '6.00', description: 'Basis 6%', taxDeclarationBox: 3 },
    { code: 'BE00', rate: '0.00', description: 'Vrijgesteld', taxDeclarationBox: 0 }
];

export const SEED_PARTNERS: SeedPartner[] = [
    { 
        name: 'Proximus', 
        orgName: 'Alpha Tech BV', 
        isSupplier: true, 
        isCustomer: false, 
        vatNr: 'BE0441255457',
        peppolId: '0106:BE0441255457',
        preferredOrderChannel: 'PEPPOL',
        preferredInvoiceChannel: 'PEPPOL'
    },
    { 
        name: 'Vlaamse Overheid', 
        orgName: 'Alpha Tech BV', 
        isSupplier: false, 
        isCustomer: true, 
        preferredOrderChannel: 'EMAIL',
        preferredInvoiceChannel: 'EMAIL'
    },
    {
        name: 'Tech Distri NV',
        orgName: 'Beta Solutions NV',
        isSupplier: true,
        isCustomer: false,
        vatNr: 'BE0888777666',
        preferredOrderChannel: 'PLATFORM',
        preferredInvoiceChannel: 'PEPPOL'
    }
];

// --- Pilaar 3: Grootboek (MAR - Standaard Belgisch) ---
export const SEED_LEDGER_ACCOUNTS: SeedLedgerAccount[] = [
    { code: 604000, name: 'Aankopen handelsgoederen', category: 'EXPENSE' },
    { code: 610000, name: 'Huur en huurlasten', category: 'EXPENSE' },
    { code: 700000, name: 'Verkopen handelsgoederen', category: 'REVENUE' },
    { code: 550000, name: 'Bankrekening courant', category: 'ASSET' },
    { code: 400000, name: 'Handelsdebiteuren', category: 'ASSET' },
    { code: 440000, name: 'Handelscrediteuren', category: 'LIABILITY' }
];

export const SEED_JOURNALS: SeedJournal[] = [
    { name: 'Aankoopdagboek', type: 'AANKOOP', code: 'AK', orgName: 'Alpha Tech BV' },
    { name: 'Verkoopdagboek', type: 'VERKOOP', code: 'VK', orgName: 'Alpha Tech BV' },
    { name: 'Bank BNP', type: 'BANK', code: 'BNP', orgName: 'Alpha Tech BV' },
    { name: 'Diverse Posten', type: 'DIVERS', code: 'DP', orgName: 'Alpha Tech BV' }
];

export const SEED_ANALYTIC_ACCOUNTS: SeedAnalyticAccount[] = [
    { name: 'Project AI Tool', code: 'PRJ-AI-01', orgName: 'Alpha Tech BV' },
    { name: 'Marketing Q1', code: 'MKT-2026-Q1', orgName: 'Alpha Tech BV' },
    { name: 'R&D Cloud', code: 'RD-CLD', orgName: 'Beta Solutions NV' }
];