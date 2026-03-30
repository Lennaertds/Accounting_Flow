// backend/src/drizzle/seed-data.ts
import { Role } from '../auth/roles';
import { 
    SeedOrganization, SeedUser, SeedVatCode, SeedPartner, 
    SeedLedgerAccount, SeedJournal, SeedAnalyticAccount, SeedJournalEntry, 
    SeedTransaction, SeedAsset, SeedBudget, SeedIncomingInvoice, 
    SeedOutgoingInvoice, SeedIncomingOrder, SeedOutgoingOrder, SeedBankStatement, 
    SeedFollowUpLogs
} from './seed-types';
import 'dotenv/config';

// ==========================================
// THEMA 1: CORE & AUTH
// ==========================================
export const SEED_ORGANIZATIONS: SeedOrganization[] = [
    { seedKey: "ALPHA", name: 'Alpha Tech BV', vat: 'BE0123456789', iban: 'BE68123456789012' },
    { seedKey: "BETA", name: 'Beta Solutions NV', vat: 'BE0987654321', iban: 'BE68987654321098' }
];

export const SEED_USERS: SeedUser[] = [
  {
    orgSeedKey: "ALPHA",
    firstName: "Admin",
    lastName: "Alpha",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: Role.ADMIN,
  },
  {
    orgSeedKey: "ALPHA",
    firstName: "Accountant",
    lastName: "Alpha",
    email: "accountant@alpha.com",
    password: "password123",
    role: Role.ACCOUNTANT,
  },
  {
    orgSeedKey: "BETA",
    firstName: "Ceo",
    lastName: "Beta",
    email: "ceo@beta.com",
    password: "password123",
    role: Role.VIEWER,
  },
];

// ==========================================
// THEMA 2: DIMENSIONS
// ==========================================
export const SEED_PARTNERS: SeedPartner[] = [
    { 
        orgSeedKey: "ALPHA",
        name: 'Proximus', 
        isSupplier: true, 
        isCustomer: false,
        isPeppolReady: true,
        vat: 'BE0441255457',
        peppolId: '0106:BE0441255457',
        preferredOrderChannel: 'PEPPOL',
        preferredInvoiceChannel: 'PEPPOL'
    },
    { 
        orgSeedKey: "ALPHA",
        name: 'Vlaamse Overheid', 
        isSupplier: false, 
        isCustomer: true,
        isPeppolReady: false,
        preferredOrderChannel: 'EMAIL',
        preferredInvoiceChannel: 'EMAIL'
    },
    {
        orgSeedKey: "BETA",
        name: 'Tech Distri NV',
        isSupplier: true,
        isCustomer: false,
        isPeppolReady: true,
        vat: 'BE0888777666',
        preferredOrderChannel: 'PLATFORM',
        preferredInvoiceChannel: 'PEPPOL'
    }
];

export const SEED_VAT_CODES: SeedVatCode[] = [
    { orgSeedKey: "ALPHA", code: 'BE21', rate: '21.00', description: 'Standaard 21%', taxDeclarationBox: 1 },
    { orgSeedKey: "ALPHA", code: 'BE12', rate: '12.00', description: 'Verlaagd 12%', taxDeclarationBox: 2 },
    { orgSeedKey: "BETA", code: 'BE06', rate: '0.00', description: 'Basis 6%', taxDeclarationBox: 3 }, // Fixed rate format
    { orgSeedKey: "BETA", code: 'BE00', rate: '0.00', description: 'Vrijgesteld', taxDeclarationBox: 0 }
];

export const SEED_ANALYTIC_ACCOUNTS: SeedAnalyticAccount[] = [
    { orgSeedKey: "ALPHA", name: 'Project AI Tool', code: 'PRJ-AI-01', active: true },
    { orgSeedKey: "BETA", name: 'Marketing Q1', code: 'MKT-2026-Q1', active: true },
    { orgSeedKey: "ALPHA", name: 'Algemene Kosten', code: 'GENERAL', active: true }
];

// ==========================================
// THEMA 3: PILAAR 3 (LEDGER)
// ==========================================
export const SEED_LEDGER_ACCOUNTS: SeedLedgerAccount[] = [
    { orgSeedKey: "ALPHA", code: 240000, name: 'Meubilair en kantoormaterieel', category: 'ASSET' },
    { orgSeedKey: "ALPHA", code: 400000, name: 'Handelsdebiteuren', category: 'ASSET' },
    { orgSeedKey: "ALPHA", code: 440000, name: 'Handelscrediteuren', category: 'LIABILITY' },
    { orgSeedKey: "BETA", code: 550000, name: 'KBC Zichtrekening', category: 'ASSET' },
    { orgSeedKey: "BETA", code: 610000, name: 'Huur en huurlasten', category: 'EXPENSE' },
    { orgSeedKey: "BETA", code: 604000, name: 'Aankopen handelsgoederen', category: 'EXPENSE' },
    { orgSeedKey: "BETA", code: 700000, name: 'Verkopen handelsgoederen', category: 'REVENUE' }
];

export const SEED_JOURNALS: SeedJournal[] = [
    { orgSeedKey: "ALPHA", name: 'Aankoopdagboek', type: 'AANKOOP', code: 'AAK' },
    { orgSeedKey: "ALPHA", name: 'Verkoopdagboek', type: 'VERKOOP', code: 'VKO' },
    { orgSeedKey: "BETA", name: 'Bankdagboek',    type: 'BANK',    code: 'BNK' },
    { orgSeedKey: "BETA", name: 'Diversen',       type: 'DIVERSEN', code: 'DIV' }
];

export const SEED_JOURNAL_ENTRIES: SeedJournalEntry[] = [
    { orgSeedKey: "ALPHA", journalCode: 'AAK', date: '2026-03-01', description: 'Aankoop Dell Laptop XPS' },
    { orgSeedKey: "ALPHA", journalCode: 'AAK', date: '2026-03-05', description: 'Factuur Proximus Maart' },
    { orgSeedKey: "BETA", journalCode: 'BNK', date: '2026-03-10', description: 'Betaling Huur Kantoor' }
];

export const SEED_TRANSACTIONS: SeedTransaction[] = [
    { orgSeedKey: "ALPHA", entryDescription: 'Aankoop Dell Laptop XPS', ledgerCode: 240000, amount: '1500.00', analyticCode: 'GENERAL', isReconciled: false },
    { orgSeedKey: "ALPHA", entryDescription: 'Aankoop Dell Laptop XPS', ledgerCode: 440000, amount: '-1500.00', isReconciled: false },
    { orgSeedKey: "BETA", entryDescription: 'Betaling Huur Kantoor', ledgerCode: 610000, amount: '1200.00', analyticCode: 'GENERAL', isReconciled: true },
    { orgSeedKey: "BETA", entryDescription: 'Betaling Huur Kantoor', ledgerCode: 550000, amount: '-1200.00', isReconciled: true }
];

export const SEED_ASSETS: SeedAsset[] = [
    { 
        orgSeedKey: "ALPHA", 
        name: 'Dell Laptop XPS 15', 
        purchaseEntryDescription: 'Aankoop Dell Laptop XPS', 
        totalValue: '1500.00', 
        depreciationMonths: 36, 
        startDate: '2026-04-01' 
    },
    { 
        orgSeedKey: "BETA", 
        name: 'Kantoormeubilair Set A', 
        purchaseEntryDescription: 'Inrichting nieuw kantoor', 
        totalValue: '5000.00', 
        depreciationMonths: 60, 
        startDate: '2026-01-01' 
    }
];

export const SEED_BUDGETS: SeedBudget[] = [
    { orgSeedKey: "ALPHA", ledgerCode: 610000, amountLimit: '15000.00', period: '2026' },
    { orgSeedKey: "BETA", ledgerCode: 604000, analyticCode: 'MKT-2026-Q1', amountLimit: '5000.00', period: '2026-Q1' }
];

// ==========================================
// THEMA 4: DOCUMENTEN (P1, P2, P4, P5)
// ==========================================
export const SEED_INCOMING_INVOICES: SeedIncomingInvoice[] = [
    {
        orgSeedKey: "ALPHA",  
        supplierName: 'Proximus', invoiceNr: 'INV-2026-001', 
        date: '2026-03-01', totalExclVat: '1500.00', vatCode: 'BE21', 
        status: 'MATCHED', isPeppol: true, ocrConfidence: '0.99'
    },
    {
        orgSeedKey: "BETA",  
        supplierName: 'Tech Distri NV', invoiceNr: 'AWS-998877', 
        date: '2026-03-05', totalExclVat: '450.25', vatCode: 'BE06', 
        status: 'PENDING', isPeppol: false, ocrConfidence: '0.85'
    }
];

export const SEED_OUTGOING_INVOICES: SeedOutgoingInvoice[] = [
    { 
        orgSeedKey: "ALPHA", 
        customerName: 'Vlaamse Overheid', 
        invoiceNr: '2026-SLS-001', 
        date: '2026-03-15', 
        dueDate: '2026-04-14', 
        totalExclVat: '2500.00', 
        vatCode: 'BE21', 
        peppolStatus: 'SENT' 
    },
    { 
        orgSeedKey: "BETA", 
        customerName: 'Tech Distri NV', // Als klant
        invoiceNr: 'FACT-BETA-001', 
        date: '2026-03-20', 
        totalExclVat: '125.50', 
        vatCode: 'BE06', 
        peppolStatus: 'DRAFT' 
    }
];

export const SEED_INCOMING_ORDERS: SeedIncomingOrder[] = [
    { 
        orgSeedKey: "ALPHA", 
        customerName: 'Vlaamse Overheid', 
        date: '2026-03-01', 
        source: 'PEPPOL', 
        referenceExt: 'ORDER-VLA-2026-001', 
        totalEstimated: '5000.00',
        status: 'RECEIVED'
    }
];

export const SEED_OUTGOING_ORDERS: SeedOutgoingOrder[] = [
    { 
        orgSeedKey: "ALPHA", 
        supplierName: 'Proximus', 
        orderNr: 'ORD-999', 
        date: '2026-03-10', 
        totalEstimated: '2100.00', 
        channel: 'PEPPOL', 
        status: 'INVOICED' 
    }
];

// ==========================================
// THEMA 5: BANKING
// ==========================================
export const SEED_BANK_STATEMENTS: SeedBankStatement[] = [
    { 
        orgSeedKey: "ALPHA", 
        date: '2026-03-10', amount: '-1200.00', 
        communication: 'HUUR MAART 2026', 
        counterpartyIban: 'BE991234567890', bankReference: 'STMT-2026-001' 
    }
];

// ==========================================
// THEMA 6: MATCHING & LOGS
// ==========================================
export const SEED_FOLLOW_UP_LOGS: SeedFollowUpLogs[] = [
    {
        orgSeedKey: 'ALPHA',
        userEmail: process.env.ADMIN_EMAIL || 'admin@alpha.com', 
        actionTaken: 'Verschil in eenheidsprijs geconstateerd tussen Order #ORD-999 en Factuur #INV-2026-001.',
        statusAfterAction: 'DISPUTE_OPENED',
    },
    {
        orgSeedKey: 'BETA',
        userEmail: 'ceo@beta.com', 
        actionTaken: 'Nieuwe factuur gestuurd via PEPPOL na correctie manco.',
        statusAfterAction: 'RESOLVED',
    }
];