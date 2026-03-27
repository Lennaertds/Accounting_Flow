// backend/src/drizzle/seed-data.ts
import { Role } from '../auth/roles';
import { 
    SeedOrganization, SeedUser, SeedVatCode, SeedPartner, 
    SeedLedgerAccount, SeedJournal, SeedAnalyticAccount, SeedJournalEntry, 
    SeedTransaction
} from './seed-types';

export const SEED_ORGANIZATIONS: SeedOrganization[] = [
    { name: 'Alpha Tech BV', vat: 'BE0123456789', iban: 'BE68123456789012' },
    { name: 'Beta Solutions NV', vat: 'BE0987654321', iban: 'BE68987654321098' }
];

export const SEED_USERS: SeedUser[] = [
  {
    orgId: "550e8400-e29b-41d4-a716-446655440000",
    firstName: "admin",
    lastName: "test",
    email: "admin@test.com",
    role: Role.ADMIN,
  },
  {
    orgId: "11111111-1111-1111-1111-111111111111",
    firstName: "accountant",
    lastName: "alpha",
    email: "accountant@alpha.com",
    role: Role.ACCOUNTANT,
  },
  {
    orgId: "22222222-2222-2222-2222-222222222222",
    firstName: "viewer",
    lastName: "alpha",
    email: "boss@beta.com",
    role: Role.VIEWER,
  },
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
        orgId: '550e8400-e29b-41d4-a716-446655440000', 
        isSupplier: true, 
        isCustomer: false, 
        vat: 'BE0441255457',
        peppolId: '0106:BE0441255457',
        preferredOrderChannel: 'PEPPOL',
        preferredInvoiceChannel: 'PEPPOL'
    },
    { 
        name: 'Vlaamse Overheid', 
        orgId: '11111111-1111-1111-1111-111111111111', 
        isSupplier: false, 
        isCustomer: true,
        preferredOrderChannel: 'EMAIL',
        preferredInvoiceChannel: 'EMAIL'
    },
    {
        name: 'Tech Distri NV',
        orgId: '22222222-2222-2222-2222-222222222222',
        isSupplier: true,
        isCustomer: false,
        vat: 'BE0888777666',
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

// --- Pilaar 3: Journals ---
export const SEED_JOURNALS: SeedJournal[] = [
    { name: 'Purchase Journal', type: 'PURCHASE', code: 'PUR',  orgName: 'Alpha Tech BV' },
    { name: 'Sales Journal',    type: 'SALE',     code: 'SAL',  orgName: 'Alpha Tech BV' },
    { name: 'KBC Bank',         type: 'BANK',     code: 'BNK1', orgName: 'Alpha Tech BV' },
    { name: 'General Journal',  type: 'GENERAL',  code: 'GEN',  orgName: 'Alpha Tech BV' }
];

export const SEED_JOURNAL_ENTRIES: SeedJournalEntry[] = [
    { date: '2026-01-15', description: 'Beginbalans 2026' },
    { date: '2026-02-10', description: 'Kantoorbenodigdheden ACME' },
    { date: '2026-03-01', description: 'Huur betaling Maart' }
];

export const SEED_ANALYTIC_ACCOUNTS: SeedAnalyticAccount[] = [
    { name: 'Project AI Tool', code: 'PRJ-AI-01', orgName: 'Alpha Tech BV' },
    { name: 'Marketing Q1', code: 'MKT-2026-Q1', orgName: 'Alpha Tech BV' },
    { name: 'R&D Cloud', code: 'RD-CLD', orgName: 'Beta Solutions NV' }
];

export const SEED_TRANSACTIONS: SeedTransaction[] = [
    { entryDescription: 'Kantoorbenodigdheden ACME', ledgerCode: 604000, amount: '100.00', analyticCode: 'PRJ-AI-01' },
    { entryDescription: 'Kantoorbenodigdheden ACME', ledgerCode: 440000, amount: '-100.00' },
    { entryDescription: 'Huur betaling Maart', ledgerCode: 610000, amount: '1200.00' },
    { entryDescription: 'Huur betaling Maart', ledgerCode: 550000, amount: '-1200.00' }
];