// backend/src/drizzle/seed-data.ts
import { Role } from '../auth/roles';
import { 
    SeedFollowUpLogs,
    SeedProducts,
    SeedOrganizations,
    SeedUsers,
    SeedPartners,
    SeedVatCodes,
    SeedAnalyticAccounts,
    SeedBankStatements,
    SeedSepaExports,
    SeedQuotations,
    SeedOutgoingOrders,
    SeedGoodsReceipts,
    SeedIncomingInvoices,
    SeedInventoryMutations,
    SeedIncomingOrders,
    SeedOutgoingInvoices,
    SeedAccountingPeriods,
    SeedInteractionLogs,
    SeedInvoiceDisputes,
    SeedUserDashboardConfigs,
    SeedAuditLogs,
    SeedBudgets,
    SeedAssets,
    SeedTransactions,
    SeedJournalEntries,
    SeedLedgerAccounts,
    SeedJournals,
    SeedReconciliationLogs
} from './seed-types';
import 'dotenv/config';

// ==========================================
// THEMA 0: FOUNDATION & AUTH (Organisatie & Gebruikers)
// ==========================================
export const SEED_ORGANIZATIONS: SeedOrganizations = [
    { seedKey: "ALPHA", name: 'Alpha Tech BV', vat: 'BE0123456789', iban: 'BE68123456789012' },
    { seedKey: "BETA", name: 'Beta Solutions NV', vat: 'BE0987654321', iban: 'BE68987654321098' }
];

export const SEED_USERS: SeedUsers = [
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
// THEMA 1: STAMGEGEVENS (Dimensions)
// ==========================================
export const SEED_PARTNERS: SeedPartners = [
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

export const SEED_PRODUCTS: SeedProducts = [
    {
        orgSeedKey: "ALPHA",
        sku: "PROD-001",
        name: "Dell XPS 15 Laptop",
        unit: "stuk",
        active: true
    },
    {
        orgSeedKey: "ALPHA",
        sku: "PROD-002",
        name: "Logitech MX Master 3S",
        unit: "stuk",
        active: true
    },
    {
        orgSeedKey: "ALPHA",
        sku: "PROD-SERV-01",
        name: "Cloud Support (per uur)",
        unit: "uur",
        active: true
    },
    {
        orgSeedKey: "ALPHA",
        sku: "PROD-SERV-02",
        name: "Security Audit",
        unit: "dag",
        active: true
    },
    {
        orgSeedKey: "BETA",
        sku: "BETA-HW-01",
        name: "Server Rack Unit",
        unit: "stuk",
        active: true
    }
];

export const SEED_VAT_CODES: SeedVatCodes = [
    { orgSeedKey: "ALPHA", code: 'BE21', rate: '21.00', description: 'Standaard 21%', taxDeclarationBox: 1 },
    { orgSeedKey: "ALPHA", code: 'BE12', rate: '12.00', description: 'Verlaagd 12%', taxDeclarationBox: 2 },
    { orgSeedKey: "BETA", code: 'BE06', rate: '0.00', description: 'Basis 6%', taxDeclarationBox: 3 }, // Fixed rate format
    { orgSeedKey: "BETA", code: 'BE00', rate: '0.00', description: 'Vrijgesteld', taxDeclarationBox: 0 }
];

export const SEED_ANALYTIC_ACCOUNTS: SeedAnalyticAccounts = [
    { orgSeedKey: "ALPHA", name: 'Project AI Tool', code: 'PRJ-AI-01', active: true },
    { orgSeedKey: "BETA", name: 'Marketing Q1', code: 'MKT-2026-Q1', active: true },
    { orgSeedKey: "ALPHA", name: 'Algemene Kosten', code: 'GENERAL', active: true }
];

// ==========================================
// THEMA 2: BANKING & RECONCILIATION
// ==========================================
export const SEED_BANK_STATEMENTS: SeedBankStatements = [
    { 
        orgSeedKey: "ALPHA", 
        date: '2026-03-10', 
        amount: '-1200.00', 
        communication: 'HUUR MAART 2026', 
        counterpartyIban: 'BE991234567890', 
        bankReference: 'STMT-2026-001' 
    },
    { 
        orgSeedKey: "ALPHA", 
        date: '2026-03-15', 
        amount: '2500.00', 
        communication: 'INV-2026-001 ALPHA TECH', 
        counterpartyIban: 'BE88000111222333', 
        bankReference: 'STMT-2026-002' 
    }
];

export const SEED_SEPA_EXPORTS: SeedSepaExports = [
    { 
        orgSeedKey: "ALPHA", 
        createdByEmail: process.env.ADMIN_EMAIL!, 
        filename: "SEPA_BATCH_2026_001.xml", 
        executionDate: "2026-04-01", 
        status: "GENERATED" 
    }
];

// ==========================================
// THEMA 3: INKOOP & VOORRAAD (Pilaar 1, 3 & 5)
// ==========================================
export const SEED_QUOTATIONS: SeedQuotations = [
    {
        orgSeedKey: "ALPHA",
        partnerName: "Vlaamse Overheid",
        quotationNr: "QUOT-2026-001",
        version: 1,
        status: "SIGNED",
        totalAmount: "5000.00"
    },
    {
        orgSeedKey: "ALPHA",
        partnerName: "Proximus",
        quotationNr: "QUOT-2026-002",
        version: 1,
        status: "DRAFT",
        totalAmount: "1250.50"
    },
    {
        orgSeedKey: "ALPHA",
        partnerName: "Beta Solutions NV",
        quotationNr: "QUOT-2026-003",
        version: 2,
        status: "EXPIRED",
        totalAmount: "850.00"
    },
    {
        orgSeedKey: "BETA",
        partnerName: "Alpha Tech BV",
        quotationNr: "QUOT-BETA-01",
        version: 1,
        status: "SENT",
        totalAmount: "3200.00"
    }
];

// ==========================================
// THEMA 3: INKOOP & VOORRAAD (Uitgebreid)
// ==========================================

export const SEED_OUTGOING_ORDERS: SeedOutgoingOrders = [
    { 
        orgSeedKey: "ALPHA", 
        supplierName: 'Proximus', 
        orderNr: 'ORD-999', 
        date: '2026-03-10', 
        totalEstimated: '2100.00', 
        channel: 'PEPPOL', 
        status: 'RECEIVED',
        lines: [{ productSku: 'PROD-001', description: 'Dell XPS 15', quantity: '2', unitPrice: '1050.00', vatCode: 'BE-BTW-21' }]
    },
    { 
        orgSeedKey: "ALPHA", 
        supplierName: 'Logitech Store', 
        orderNr: 'ORD-1000', 
        date: '2026-03-15', 
        totalEstimated: '300.00', 
        channel: 'EMAIL', 
        status: 'ORDERED',
        lines: [{ productSku: 'PROD-002', description: 'Logitech MX Master 3S', quantity: '3', unitPrice: '100.00', vatCode: 'BE-BTW-21' }]
    },
    { 
        orgSeedKey: "BETA", 
        supplierName: 'Proximus', 
        orderNr: 'ORD-BETA-01', 
        date: '2026-03-20', 
        totalEstimated: '1050.00', 
        channel: 'PLATFORM', 
        status: 'RECEIVED',
        lines: [{ productSku: 'BETA-HW-01', description: 'Server Rack Unit', quantity: '1', unitPrice: '1050.00', vatCode: 'BE-BTW-21' }]
    }
];

export const SEED_GOODS_RECEIPTS: SeedGoodsReceipts = [
    {
        orgSeedKey: "ALPHA",
        orderNr: 'ORD-999',
        receivedByEmail: "accountant@alpha.com",
        deliveryNoteRef: "LEVER-888-2026",
        lines: [{ productSku: 'PROD-001', quantityReceived: '2', condition: 'GOOD' }]
    },
    {
        orgSeedKey: "ALPHA",
        orderNr: 'ORD-1000',
        receivedByEmail: "admin@alpha.com",
        deliveryNoteRef: "LOGI-PARTIAL-01",
        lines: [{ productSku: 'PROD-002', quantityReceived: '1', condition: 'DAMAGED' }]
    },
    {
        orgSeedKey: "BETA",
        orderNr: 'ORD-BETA-01',
        receivedByEmail: "admin@beta.com",
        deliveryNoteRef: "BETA-SHIP-01",
        lines: [{ productSku: 'BETA-HW-01', quantityReceived: '1', condition: 'GOOD' }]
    }
];

export const SEED_INCOMING_INVOICES: SeedIncomingInvoices = [
    {
        orgSeedKey: "ALPHA",
        supplierName: 'Proximus',
        invoiceNr: 'INV-PROX-2026',
        date: '2026-03-12',
        totalExclVat: '2100.00',
        vatCode: 'BE-BTW-21',
        status: 'MATCHED',
        isPeppol: true,
        lines: [{ productSku: 'PROD-001', description: 'Dell XPS 15 (Order ORD-999)', quantity: '2', unitPrice: '1050.00', vatCode: 'BE-BTW-21', ledgerAccountCode: 600000 }]
    },
    {
        orgSeedKey: "ALPHA",
        supplierName: 'Logitech Store',
        invoiceNr: 'INV-LOGI-333',
        date: '2026-03-18',
        totalExclVat: '300.00',
        vatCode: 'BE-BTW-21',
        status: 'DISCREPANCY',
        isPeppol: false,
        lines: [{ productSku: 'PROD-002', description: 'Logitech MX Master 3S', quantity: '3', unitPrice: '100.00', vatCode: 'BE-BTW-21', ledgerAccountCode: 600000 }]
    }
];

export const SEED_INVENTORY_MUTATIONS: SeedInventoryMutations = [
    {
        orgSeedKey: "ALPHA",
        productSku: 'PROD-001',
        change: '2',
        valuation: 'FIFO',
        sourceType: 'GOODS_RECEIPT',
        sourceReference: 'LEVER-888-2026'
    },
    {
        orgSeedKey: "BETA",
        productSku: 'BETA-HW-01',
        change: '1',
        valuation: 'GIP',
        sourceType: 'GOODS_RECEIPT',
        sourceReference: 'BETA-SHIP-01'
    },
    {
        orgSeedKey: "ALPHA",
        productSku: 'PROD-001',
        change: '-1',
        valuation: 'FIFO',
        sourceType: 'MANUAL',
        sourceReference: 'EIGEN-GEBRUIK-KEUKEN'
    }
];

// ==========================================
// THEMA 4: VERKOOP (Uitgebreid)
// ==========================================

export const SEED_INCOMING_ORDERS: SeedIncomingOrders = [
    // Scenario 1: Grote overheidsorder via Peppol
    { 
        orgSeedKey: "ALPHA", 
        customerName: 'Vlaamse Overheid', 
        orderNr: 'ORDER-VLA-2026-001',
        date: '2026-03-01', 
        source: 'PEPPOL', 
        referenceExt: 'EXT-REF-VLA-01', 
        totalEstimated: '5000.00',
        status: 'CONFIRMED',
        aiSummary: "Raamovereenkomst voor Cloud Support Q1",
        lines: [
            { productSku: 'PROD-SERV-01', description: 'Cloud Support', quantity: '50', unitPrice: '100.00', vatCode: 'BE-BTW-21' }
        ]
    },
    // Scenario 2: Webshop order via Platform
    {
        orgSeedKey: "ALPHA",
        customerName: 'Beta Solutions NV',
        orderNr: 'WEB-2026-441',
        date: '2026-03-14',
        source: 'PLATFORM',
        referenceExt: 'SHOP-9922',
        totalEstimated: '121.00',
        status: 'RECEIVED',
        lines: [
            { productSku: 'PROD-002', description: 'Logitech MX Master 3S', quantity: '1', unitPrice: '100.00', vatCode: 'BE-BTW-21' }
        ]
    },
    // Scenario 3: Order voor BETA organisatie
    {
        orgSeedKey: "BETA",
        customerName: 'Alpha Tech BV',
        orderNr: 'BETA-ORD-001',
        date: '2026-03-15',
        source: 'EMAIL_AI',
        referenceExt: 'EMAIL-MATCH-99',
        totalEstimated: '3200.00',
        status: 'RECEIVED',
        lines: [
            { productSku: 'BETA-HW-01', description: 'Server Rack Setup', quantity: '1', unitPrice: '3200.00', vatCode: 'BE-BTW-21' }
        ]
    }
];

export const SEED_OUTGOING_INVOICES: SeedOutgoingInvoices = [
    // Scenario 1: Reeds betaalde Peppol factuur
    {
        orgSeedKey: "ALPHA",
        customerName: 'Vlaamse Overheid',
        invoiceNr: 'OUT-2026-001',
        date: '2026-03-05',
        dueDate: '2026-04-05',
        totalExclVat: '5000.00',
        vatCode: 'BE-BTW-21',
        status: 'PAID',
        peppolStatus: 'DELIVERED',
        lines: [
            { productSku: 'PROD-SERV-01', description: 'Consultancy Cloud Support', quantity: '50', unitPrice: '100.00', vatCode: 'BE-BTW-21', ledgerAccountCode: 700000 }
        ]
    },
    // Scenario 2: Concept factuur (nog niet verzonden)
    {
        orgSeedKey: "ALPHA",
        customerName: 'Beta Solutions NV',
        invoiceNr: 'OUT-2026-002',
        date: '2026-03-16',
        dueDate: '2026-04-16',
        totalExclVat: '100.00',
        vatCode: 'BE-BTW-21',
        status: 'DRAFT',
        peppolStatus: 'NONE',
        lines: [
            { productSku: 'PROD-002', description: 'Logitech MX Master 3S', quantity: '1', unitPrice: '100.00', vatCode: 'BE-BTW-21', ledgerAccountCode: 700000 }
        ]
    },
    // Scenario 3: Achterstallige factuur (Overdue)
    {
        orgSeedKey: "ALPHA",
        customerName: 'Proximus',
        invoiceNr: 'OUT-2026-003',
        date: '2026-02-01',
        dueDate: '2026-03-01',
        totalExclVat: '1500.00',
        vatCode: 'BE-BTW-21',
        status: 'SENT',
        peppolStatus: 'DELIVERED',
        lines: [
            { description: 'Algemene IT Audit', quantity: '1', unitPrice: '1500.00', vatCode: 'BE-BTW-21', ledgerAccountCode: 700000 }
        ]
    }
];

// ==========================================
// THEMA 5: ACCOUNTING & MATCHING
// ==========================================
export const SEED_JOURNALS: SeedJournals = [
    { orgSeedKey: "ALPHA", name: 'Aankoopdagboek', type: 'AANKOOP', code: 'ANK' },
    { orgSeedKey: "ALPHA", name: 'Verkoopdagboek', type: 'VERKOOP', code: 'VRK' },
    { orgSeedKey: "ALPHA", name: 'Bank @ KBC', type: 'BANK', code: 'KBC' }
];

export const SEED_LEDGER_ACCOUNTS: SeedLedgerAccounts = [
    { orgSeedKey: "ALPHA", code: 600000, name: 'Handelsgoederen', category: 'EXPENSE' },
    { orgSeedKey: "ALPHA", code: 700000, name: 'Omzet', category: 'REVENUE' },
    { orgSeedKey: "ALPHA", code: 240000, name: 'Meubilair & Apparatuur', category: 'ASSET' },
    { orgSeedKey: "ALPHA", code: 400000, name: 'Handelsdebiteuren', category: 'ASSET' },
    { orgSeedKey: "ALPHA", code: 440000, name: 'Handelscrediteuren', category: 'LIABILITY' }
];

export const SEED_JOURNAL_ENTRIES: SeedJournalEntries = [
    { 
        orgSeedKey: "ALPHA", 
        journalCode: 'ANK', 
        date: '2026-03-12', 
        description: 'Aankoop Dell Laptops - INV-PROX-2026' 
    },
    { 
        orgSeedKey: "ALPHA", 
        journalCode: 'VRK', 
        date: '2026-03-05', 
        description: 'Verkoop Cloud Support - OUT-2026-001' 
    }
];

export const SEED_TRANSACTIONS: SeedTransactions = [
    { orgSeedKey: "ALPHA", entryDescription: 'Aankoop Dell Laptops - INV-PROX-2026', ledgerCode: 600000, amount: '2100.00', isReconciled: false },
    { orgSeedKey: "ALPHA", entryDescription: 'Aankoop Dell Laptops - INV-PROX-2026', ledgerCode: 440000, amount: '-2100.00', isReconciled: false },
    { orgSeedKey: "ALPHA", entryDescription: 'Verkoop Cloud Support - OUT-2026-001', ledgerCode: 400000, amount: '5000.00', isReconciled: false },
    { orgSeedKey: "ALPHA", entryDescription: 'Verkoop Cloud Support - OUT-2026-001', ledgerCode: 700000, amount: '-5000.00', isReconciled: false }
];

export const SEED_RECONCILIATION_LOGS: SeedReconciliationLogs = [
    {
        orgSeedKey: "ALPHA",
        bankReference: "STMT-2026-002",
        journalEntryDescription: "Verkoop Cloud Support - OUT-2026-001",
        ledgerCode: 400000,
        matchType: "AUTO"
    }
];

export const SEED_ASSETS: SeedAssets = [
    { 
        orgSeedKey: "ALPHA", 
        name: "Dell XPS Laptops Set (2x)", 
        purchaseEntryDescription: "Aankoop Dell Laptops - INV-PROX-2026", 
        totalValue: "2100.00", 
        depreciationMonths: 36, 
        startDate: "2026-04-01" 
    },
    { 
        orgSeedKey: "ALPHA", 
        name: "Ergonomische Bureaus", 
        purchaseEntryDescription: "Kantoorinrichting Maart", 
        totalValue: "4500.00", 
        depreciationMonths: 120,
        startDate: "2026-04-01" 
    },
    { 
        orgSeedKey: "ALPHA", 
        name: "ERP Systeem Licentie", 
        purchaseEntryDescription: "Software Implementatie", 
        totalValue: "15000.00", 
        depreciationMonths: 60,
        startDate: "2026-01-01" 
    },
    { 
        orgSeedKey: "BETA", 
        name: "Server Rack B-01", 
        purchaseEntryDescription: "Server Rack Setup", 
        totalValue: "3200.00", 
        depreciationMonths: 48,
        startDate: "2026-03-01" 
    }
];

export const SEED_BUDGETS: SeedBudgets = [
    { 
        orgSeedKey: "ALPHA", 
        ledgerCode: 600000, 
        amountLimit: "10000.00", 
        period: "Q1-2026" 
    },
    { 
        orgSeedKey: "ALPHA", 
        ledgerCode: 610000, 
        amountLimit: "2500.00", 
        period: "Q1-2026" 
    },
    { 
        orgSeedKey: "ALPHA", 
        ledgerCode: 610000, 
        amountLimit: "5000.00", 
        period: "Q2-2026" 
    },
    { 
        orgSeedKey: "ALPHA", 
        ledgerCode: 620000, 
        amountLimit: "1500.00", 
        period: "2026" 
    },
    { 
        orgSeedKey: "BETA", 
        ledgerCode: 600000, 
        amountLimit: "25000.00", 
        period: "Q1-2026" 
    }
];

// ==========================================
// THEMA 6: GOVERNANCE, LOGS & CONFIG (Uitgebreid)
// ==========================================

export const SEED_ACCOUNTING_PERIODS: SeedAccountingPeriods = [
    { 
        orgSeedKey: "ALPHA", 
        name: 'FY-2025', 
        startDate: '2025-01-01', 
        endDate: '2025-12-31', 
        isLocked: true 
    },
    { 
        orgSeedKey: "ALPHA", 
        name: 'Q1-2026', 
        startDate: '2026-01-01', 
        endDate: '2026-03-31', 
        isLocked: false 
    },
    { 
        orgSeedKey: "BETA", 
        name: 'Q1-2026', 
        startDate: '2026-01-01', 
        endDate: '2026-03-31', 
        isLocked: false 
    }
];

export const SEED_AUDIT_LOGS: SeedAuditLogs = [
    {
        orgSeedKey: "ALPHA",
        userEmail: process.env.ADMIN_EMAIL!,
        action: "UPDATE",
        entityType: "ORGANIZATION_SETTINGS",
        entityReference: "ALPHA",
        changes: { iban: "BE68...9012 -> BE68...1111" }
    },
    {
        orgSeedKey: "ALPHA",
        userEmail: "accountant@alpha.com",
        action: "CREATE",
        entityType: "INCOMING_INVOICE",
        entityReference: "INV-PROX-2026",
        changes: { status: "DRAFT -> MATCHED", method: "OCR_AUTO_MATCH" }
    },
    {
        orgSeedKey: "BETA",
        userEmail: "admin@beta.com",
        action: "LOGIN",
        entityType: "USER_SESSION",
        entityReference: "admin@beta.com",
        changes: { ip: "192.168.1.1", device: "MacBook Pro" }
    }
];

export const SEED_FOLLOW_UP_LOGS: SeedFollowUpLogs = [
    {
        orgSeedKey: "ALPHA",
        userEmail: "accountant@alpha.com",
        actionTaken: "Factuur handmatig gematched met banktransactie STMT-2026-002",
        statusAfterAction: "RECONCILED"
    },
    {
        orgSeedKey: "ALPHA",
        userEmail: "admin@alpha.com",
        actionTaken: "Contact opgenomen met leverancier via telefoon i.v.m. beschadigde levering ORD-1000",
        statusAfterAction: "PENDING_CREDIT_NOTE"
    }
];

export const SEED_INTERACTION_LOGS: SeedInteractionLogs = [
    {
        orgSeedKey: "ALPHA",
        partnerName: "Proximus",
        type: "EMAIL",
        message: "Automatische bevestiging van ontvangst bestelling ORD-999",
        entityType: "ORDER",
        entityReference: "ORD-999"
    },
    {
        orgSeedKey: "ALPHA",
        partnerName: "Vlaamse Overheid",
        type: "SYSTEM_ALERT",
        message: "Peppol factuur OUT-2026-001 succesvol afgeleverd bij ontvanger",
        entityType: "INVOICE",
        entityReference: "OUT-2026-001"
    },
    {
        orgSeedKey: "ALPHA",
        partnerName: "Beta Solutions NV",
        type: "PHONE",
        message: "Klant belde voor status van offerte QUOT-2026-001. Toegezegd om uiterlijk morgen te reageren.",
        entityType: "QUOTATION",
        entityReference: "QUOT-2026-001",
        userEmail: "admin@alpha.com"
    }
];

export const SEED_INVOICE_DISPUTES: SeedInvoiceDisputes = [
    {
        orgSeedKey: "ALPHA",
        invoiceNr: "INV-PROX-2026",
        isIncoming: true,
        reason: "Verkeerd BTW tarief toegepast op lijn 1. Moet 6% zijn i.p.v. 21%.",
        status: "OPEN"
    },
    {
        orgSeedKey: "ALPHA",
        invoiceNr: "INV-LOGI-333",
        isIncoming: true,
        reason: "Hoeveelheid op factuur (3) komt niet overeen met levering (1 beschadigd).",
        status: "OPEN"
    }
];

export const SEED_DASHBOARD_CONFIGS: SeedUserDashboardConfigs = [
    {
        userEmail: process.env.ADMIN_EMAIL!,
        theme: "glassmorphism",
        layout: { 
            widgets: ["cashflow_chart", "top_customers", "pending_approvals", "bank_status"],
            refreshInterval: 300 
        }
    },
    {
        userEmail: "accountant@alpha.com",
        theme: "light",
        layout: { 
            widgets: ["vat_due_timer", "open_invoices_grid", "ledger_summary", "reconciliation_widget"],
            focusMode: true 
        }
    }
];