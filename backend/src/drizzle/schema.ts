// backend/src/drizzle/schema.ts
import { pgSchema, uuid, varchar, decimal, boolean, timestamp, date, integer, text, pgEnum, time, unique } from 'drizzle-orm/pg-core';

// --- DEFINIEER DE SCHEMAS ---
export const oltpSchema = pgSchema('pepol_app');
export const olapSchema = pgSchema('pepol_dwh');

// ==========================================
// 1. OLTP SCHEMA (Pilaar 1 t/m 5)
// ==========================================

// --- AUTH & ORG ---
export const organizations = oltpSchema.table('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  myVatNr: varchar('my_vat_nr', { length: 50 }),
  myIban: varchar('my_iban', { length: 34 }), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = oltpSchema.table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).default('user').notNull(), // ADMIN, ACCOUNTANT, VIEWER
  lastLogin: timestamp('last_login'),
});

// --- DIMENSIONS (Shared) ---
export const partners = oltpSchema.table('partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  isPeppolReady: boolean('is_peppol_ready').default(false).notNull(),
  preferredOrderChannel: varchar('preferred_order_channel', { length: 20 }).default('EMAIL').notNull(),
  preferredInvoiceChannel: varchar('preferred_invoice_channel', { length: 20 }).default('PEPPOL').notNull(),
  vatNr: varchar('vat_nr', { length: 50 }),
  peppolId: varchar('peppol_id', { length: 100 }),
  email: varchar('email', { length: 255 }),
  isCustomer: boolean('is_customer').default(false).notNull(),
  isSupplier: boolean('is_supplier').default(false).notNull(),
  bankAccountIban: varchar('bank_account_iban', { length: 34 }),
});

export const vatCodes = oltpSchema.table('vat_codes', {
    id: uuid('id').primaryKey().defaultRandom(), 
    orgId: uuid('org_id').references(() => organizations.id).notNull(),
    code: text('code').notNull(),
    rate: decimal('rate', { precision: 5, scale: 2 }).notNull(), 
    description: text('description'),
    taxDeclarationBox: integer('tax_declaration_box').notNull(),
}, (table) => {
    return {
        unq: unique().on(table.orgId, table.code),
    };
});

export const analyticAccounts = oltpSchema.table('analytic_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  active: boolean('active').default(true).notNull(),
});

// --- PILAAR 1 & 4 (INVOICES) ---
export const incomingInvoices = oltpSchema.table('incoming_invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  supplierId: uuid('supplier_id').references(() => partners.id).notNull(),
  invoiceNr: varchar('invoice_nr', { length: 100 }).notNull(),
  date: date('date').notNull(),
  dueDate: date('due_date'),
  totalExclVat: decimal('total_excl_vat', { precision: 12, scale: 2 }).notNull(),
  vatCodeId: uuid('vat_code_id').references(() => vatCodes.id).notNull(),
  status: varchar('status').default('PENDING').notNull(), // PENDING, MATCHED, DISCREPANCY
  isPeppol: boolean('is_peppol').default(false).notNull(),
  ocrConfidence: decimal('ocr_confidence'),
  rawFileStoragePath: varchar('raw_file_storage_path', { length: 100 }),
});

export const outgoingInvoices = oltpSchema.table('outgoing_invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  customerId: uuid('customer_id').references(() => partners.id).notNull(),
  invoiceNr: varchar('invoice_nr', { length: 100 }).notNull(),
  date: date('date').notNull(),
  dueDate: date('due_date'),
  vatCodeId: uuid('vat_code_id').references(() => vatCodes.id).notNull(),
  peppolStatus: varchar('peppol_status').default('DRAFT').notNull(), // DRAFT, SENT, PAID
  rawFileStoragePath: varchar('raw_file_storage_path', { length: 100 }),
});

// --- PILAAR 2 & 5 (ORDERS) ---
export const incomingOrders = oltpSchema.table('incoming_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  customerId: uuid('customer_id').references(() => partners.id).notNull(),
  source: varchar('source').notNull(), // PLATFORM, PEPPOL, EMAIL_AI
  referenceExt: varchar('reference_ext'),
  totalEstimated: decimal('total_estimated', { precision: 12, scale: 2 }).notNull(),
  aiSummary: text('ai_summary'),
});

export const outgoingOrders = oltpSchema.table('outgoing_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  supplierId: uuid('supplier_id').references(() => partners.id).notNull(),
  channel: varchar('channel').notNull(), // EMAIL, PEPPOL, PLATFORM
  status: varchar('status').default('ORDERED').notNull(), // ORDERED, RECEIVED, INVOICED
});

// --- PILAAR 3 (LEDGER) ---
export const journals = oltpSchema.table('journals', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  name: varchar('name').notNull(),
  type: varchar('type').notNull(), // AANKOOP, VERKOOP, BANK
  code: varchar('code').notNull(),
});

export const ledgerAccounts = oltpSchema.table('ledger_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: integer('code').notNull(), 
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  name: varchar('name').notNull(),
  category: varchar('category').notNull(), // ASSET, LIABILITY, etc.
});

export const journalEntries = oltpSchema.table('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  journalId: uuid('journal_id').references(() => journals.id).notNull(),
  date: date('date').notNull(),
  description: text('description').notNull(),
});

export const transactions = oltpSchema.table('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  entryId: uuid('entry_id').references(() => journalEntries.id).notNull(),
  ledgerCode: integer('ledger_code').notNull(),
  analyticAccountId: uuid('analytic_account_id').references(() => analyticAccounts.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  isReconciled: boolean('is_reconciled').default(false).notNull(),
});

export const assets = oltpSchema.table('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseEntryId: uuid('purchase_entry_id').references(() => journalEntries.id).notNull(),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }).notNull(),
  depreciationMonths: integer('depreciation_months').notNull(),
  startDate: date('startDate').notNull(),
});

export const budgets = oltpSchema.table('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  ledgerCode: integer('ledger_code').notNull(),
  analyticAccountId: uuid('analytic_account_id').references(() => analyticAccounts.id),
  amountLimit: decimal('amount_limit', { precision: 12, scale: 2 }).notNull(),
  period: varchar('period', { length: 20 }).notNull(), // bijv. "2026-Q1"
});

// --- BANKING & RECONCILIATION ---
export const bankStatements = oltpSchema.table('bank_statements', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  date: date('date').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  communication: text('communication'),
  counterpartyIban: varchar('counterparty_iban', { length: 34 }),
});

export const reconciliationLogs = oltpSchema.table('reconciliation_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  bankStatementId: uuid('bank_statement_id').references(() => bankStatements.id).notNull(),
  journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id).notNull(),
  transactionId: uuid('transaction_id').references(() => transactions.id).notNull(),
  matchType: varchar('match_type', { length: 20 }).notNull(), // AUTO, MANUAL
  reconciledAt: timestamp('reconciled_at').defaultNow().notNull(),
});

// --- MATCHING LOGIC (TRIGGERS) ---
export const followUpLogs = oltpSchema.table('follow_up_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  matchP5P1Id: uuid('match_p5_p1_id').references(() => matchP5P1.id),
  matchP2P4Id: uuid('match_p2_p4_id').references(() => matchP2P4.id),
  userId: uuid('user_id').references(() => users.id).notNull(),
  actionTaken: text('action_taken').notNull(), // bijv. "Gemaild naar supplier", "Handmatig goedgekeurd"
  statusAfterAction: varchar('status_after_action', { length: 50 }).notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const matchP5P1 = oltpSchema.table('match_p5_p1', {
  id: uuid('id').defaultRandom().primaryKey(),
  outgoingOrderId: uuid('outgoing_order_id').references(() => outgoingOrders.id).notNull(),
  incomingInvoiceId: uuid('incoming_invoice_id').references(() => incomingInvoices.id).notNull(),
});

export const matchP2P4 = oltpSchema.table('match_p2_p4', {
  id: uuid('id').defaultRandom().primaryKey(),
  incomingOrderId: uuid('incoming_order_id').references(() => incomingOrders.id).notNull(),
  outgoingInvoiceId: uuid('outgoing_invoice_id').references(() => outgoingInvoices.id).notNull(),
});

// ==========================================
// 2. OLAP SCHEMA (Data Warehouse - Sterschema)
// ==========================================

export const dimOrganization = olapSchema.table('dim_organization', {
  orgKey: integer('org_key').primaryKey(),
  orgId: uuid('org_id').notNull(), // Link naar OLTP
  name: varchar('name', { length: 255 }).notNull(),
  vatNr: varchar('vat_nr', { length: 50 }),
  iban: varchar('iban', { length: 34 }),
});

export const dimDate = olapSchema.table('dim_date', {
  dateKey: integer('date_key').primaryKey(), // YYYYMMDD
  fullDate: date('full_date').notNull(),
  day: integer('day').notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  quarter: integer('quarter').notNull(),
  fiscalYear: integer('fiscal_year').notNull(),
  fiscalPeriod: varchar('fiscal_period', { length: 10 }).notNull(),
  isPeriodClosed: boolean('is_period_closed').default(false).notNull(),
});

export const dimTime = olapSchema.table('dim_time', {
  timeKey: integer('time_key').primaryKey(), // HHMMSS
  fullTime: time('full_time').notNull(),
  hour: integer('hour').notNull(),
  minute: integer('minute').notNull(),
  second: integer('second').notNull(),
});

export const dimVat = olapSchema.table('dim_vat', {
  vatKey: integer('vat_key').primaryKey(),
  vatCode: varchar('vat_code', { length: 10 }).notNull(),
  vatRate: decimal('vat_rate', { precision: 5, scale: 2 }).notNull(),
  taxBox: integer('tax_box'),
});

export const dimTransactionType = olapSchema.table('dim_transaction_type', {
  typeKey: integer('type_key').primaryKey(),
  transactionType: varchar('transaction_type', { length: 50 }).notNull(), // INVOICE, CREDIT_NOTE
  journalSource: varchar('journal_source', { length: 50 }).notNull(), // AANKOOP, BANK
  sourcePillar: varchar('source_pillar', { length: 20 }).notNull(), // P1, P2...
  peppolStatus: varchar('peppol_status', { length: 50 }),
});

export const dimPartner = olapSchema.table('dim_partner', {
  partnerKey: integer('partner_key').primaryKey(),
  partnerId: uuid('partner_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  vatNr: varchar('vat_nr', { length: 50 }),
  peppolId: varchar('peppol_id', { length: 100 }),
  email: varchar('email', { length: 255 }),
  iban: varchar('iban', { length: 34 }),
  isCustomer: boolean('is_customer').notNull(),
  isSupplier: boolean('is_supplier').notNull(),
});

export const dimLedgerAccount = olapSchema.table('dim_ledger_account', {
  ledgerKey: integer('ledger_key').primaryKey(),
  ledgerCode: integer('ledger_code').notNull(),
  ledgerName: varchar('ledger_name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
});

export const dimAnalytic = olapSchema.table('dim_analytic', {
  analyticKey: integer('analytic_key').primaryKey(),
  analyticCode: varchar('analytic_code', { length: 50 }).notNull(),
  projectName: varchar('project_name', { length: 100 }).notNull(),
});

export const dimDocument = olapSchema.table('dim_document', {
  documentKey: integer('document_key').primaryKey(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  storagePath: varchar('storage_path', { length: 512 }).notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  ocrConfidence: decimal('ocr_confidence'),
  isPeppol: boolean('is_peppol').notNull(),
});

export const dimAudit = olapSchema.table('dim_audit', {
  auditKey: integer('audit_key').primaryKey(),
  userId: uuid('user_id').notNull(),
  userRole: varchar('user_role', { length: 50 }).notNull(),
  sourceSystem: varchar('source_system', { length: 50 }).notNull(),
  entryTimestamp: timestamp('entry_timestamp').notNull(),
});

// --- FEITEN TABELLEN ---

export const factFinancialTransactions = olapSchema.table('fact_financial_transactions', {
  id: integer('id').primaryKey(),
  dateKey: integer('date_key').references(() => dimDate.dateKey).notNull(),
  orgKey: integer('org_key').references(() => dimOrganization.orgKey).notNull(),
  timeKey: integer('time_key').references(() => dimTime.timeKey).notNull(),
  typeKey: integer('type_key').references(() => dimTransactionType.typeKey).notNull(),
  partnerKey: integer('partner_key').references(() => dimPartner.partnerKey).notNull(),
  ledgerKey: integer('ledger_key').references(() => dimLedgerAccount.ledgerKey).notNull(),
  analyticKey: integer('analytic_key').references(() => dimAnalytic.analyticKey),
  vatKey: integer('vat_key').references(() => dimVat.vatKey).notNull(),
  documentKey: integer('document_key').references(() => dimDocument.documentKey),
  auditKey: integer('audit_key').references(() => dimAudit.auditKey).notNull(),
  
  amountDebet: decimal('amount_debet', { precision: 12, scale: 2 }).notNull(),
  amountCredit: decimal('amount_credit', { precision: 12, scale: 2 }).notNull(),
  netAmount: decimal('net_amount', { precision: 12, scale: 2 }).notNull(),
  vatAmount: decimal('vat_amount', { precision: 12, scale: 2 }).notNull(),
  dueDateKey: integer('due_date_key').references(() => dimDate.dateKey),
  isReconciled: boolean('is_reconciled').notNull(),
  
  pillarMatchId: uuid('pillar_match_id'),
  isMatched: boolean('is_matched').notNull(),
  matchConfidence: decimal('match_confidence'),
});

export const factBudgetPerformance = olapSchema.table('fact_budget_performance', {
  id: integer('id').primaryKey(),
  dateKey: integer('date_key').references(() => dimDate.dateKey).notNull(),
  orgKey: integer('org_key').references(() => dimOrganization.orgKey).notNull(),
  ledgerKey: integer('ledger_key').references(() => dimLedgerAccount.ledgerKey).notNull(),
  analyticKey: integer('analytic_key').references(() => dimAnalytic.analyticKey),
  auditKey: integer('audit_key').references(() => dimAudit.auditKey).notNull(),
  
  budgetAmount: decimal('budget_amount', { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal('actual_amount', { precision: 12, scale: 2 }).notNull(),
  variance: decimal('variance', { precision: 12, scale: 2 }).notNull(),
});