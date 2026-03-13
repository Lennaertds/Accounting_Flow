import { 
  pgSchema, uuid, varchar, decimal, boolean, 
  timestamp, date, integer, text, pgEnum, time 
} from 'drizzle-orm/pg-core';

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
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = oltpSchema.table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }), // ADMIN, ACCOUNTANT, VIEWER
  lastLogin: timestamp('last_login'),
});

// --- DIMENSIONS (Shared) ---
export const partners = oltpSchema.table('partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  name: varchar('name', { length: 255 }).notNull(),
  vatNr: varchar('vat_nr', { length: 50 }),
  peppolId: varchar('peppol_id', { length: 100 }),
  email: varchar('email', { length: 255 }),
  isCustomer: boolean('is_customer').default(false),
  isSupplier: boolean('is_supplier').default(false),
  bankAccountIban: varchar('bank_account_iban', { length: 34 }),
});

export const vatCodes = oltpSchema.table('vat_codes', {
  code: varchar('code', { length: 10 }).primaryKey(),
  rate: decimal('rate', { precision: 5, scale: 2 }),
  description: text('description'),
  taxDeclarationBox: integer('tax_declaration_box'),
});

export const analyticAccounts = oltpSchema.table('analytic_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  name: varchar('name', { length: 100 }),
  code: varchar('code', { length: 50 }),
  active: boolean('active').default(true),
});

// --- PILAAR 1 & 4 (INVOICES) ---
export const incomingInvoices = oltpSchema.table('incoming_invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  supplierId: uuid('supplier_id').references(() => partners.id),
  invoiceNr: varchar('invoice_nr', { length: 100 }),
  date: date('date'),
  totalExclVat: decimal('total_excl_vat', { precision: 12, scale: 2 }),
  vatCodeId: varchar('vat_code_id').references(() => vatCodes.code),
  status: varchar('status').default('PENDING'), // PENDING, MATCHED, DISCREPANCY
  isPeppol: boolean('is_peppol').default(false),
  ocrConfidence: decimal('ocr_confidence'),
});

export const outgoingInvoices = oltpSchema.table('outgoing_invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  customerId: uuid('customer_id').references(() => partners.id),
  invoiceNr: varchar('invoice_nr', { length: 100 }),
  vatCodeId: varchar('vat_code_id').references(() => vatCodes.code),
  peppolStatus: varchar('peppol_status').default('DRAFT'), // DRAFT, SENT, PAID
});

// --- PILAAR 2 & 5 (ORDERS) ---
export const incomingOrders = oltpSchema.table('incoming_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  customerId: uuid('customer_id').references(() => partners.id),
  source: varchar('source'), // PLATFORM, PEPPOL, EMAIL_AI
  referenceExt: varchar('reference_ext'),
  totalEstimated: decimal('total_estimated', { precision: 12, scale: 2 }),
  aiSummary: text('ai_summary'),
});

export const outgoingOrders = oltpSchema.table('outgoing_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  supplierId: uuid('supplier_id').references(() => partners.id),
  channel: varchar('channel'), // EMAIL, PEPPOL, PLATFORM
  status: varchar('status').default('ORDERED'), // ORDERED, RECEIVED, INVOICED
});

// --- PILAAR 3 (LEDGER) ---
export const journals = oltpSchema.table('journals', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  name: varchar('name'),
  type: varchar('type'), // AANKOOP, VERKOOP, BANK
  code: varchar('code'),
});

export const ledgerAccounts = oltpSchema.table('ledger_accounts', {
  code: integer('code').primaryKey(),
  name: varchar('name'),
  category: varchar('category'), // ASSET, LIABILITY, etc.
});

export const journalEntries = oltpSchema.table('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  journalId: uuid('journal_id').references(() => journals.id),
  date: date('date'),
  description: text('description'),
});

export const transactions = oltpSchema.table('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  entryId: uuid('entry_id').references(() => journalEntries.id),
  ledgerCode: integer('ledger_code').references(() => ledgerAccounts.code),
  analyticAccountId: uuid('analytic_account_id').references(() => analyticAccounts.id),
  amount: decimal('amount', { precision: 12, scale: 2 }),
  isReconciled: boolean('is_reconciled').default(false),
});

export const assets = oltpSchema.table('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseEntryId: uuid('purchase_entry_id').references(() => journalEntries.id),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }),
  depreciationMonths: integer('depreciation_months'),
  startDate: date('startDate'),
});

export const budgets = oltpSchema.table('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  ledgerCode: integer('ledger_code').references(() => ledgerAccounts.code),
  analyticAccountId: uuid('analytic_account_id').references(() => analyticAccounts.id),
  amountLimit: decimal('amount_limit', { precision: 12, scale: 2 }),
  period: varchar('period', { length: 20 }), // bijv. "2026-Q1"
});

// --- BANKING & RECONCILIATION ---
export const bankStatements = oltpSchema.table('bank_statements', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  date: date('date'),
  amount: decimal('amount', { precision: 12, scale: 2 }),
  communication: text('communication'),
  counterpartyIban: varchar('counterparty_iban', { length: 34 }),
});

export const reconciliationLog = oltpSchema.table('reconciliation_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  bankStatementId: uuid('bank_statement_id').references(() => bankStatements.id),
  journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id),
  matchType: varchar('match_type', { length: 20 }), // AUTO, MANUAL
});

// --- MATCHING LOGIC (TRIGGERS) ---
export const matchP5P1 = oltpSchema.table('match_p5_p1', {
  id: uuid('id').defaultRandom().primaryKey(),
  outgoingOrderId: uuid('outgoing_order_id').references(() => outgoingOrders.id),
  incomingInvoiceId: uuid('incoming_invoice_id').references(() => incomingInvoices.id),
});

export const matchP2P4 = oltpSchema.table('match_p2_p4', {
  id: uuid('id').defaultRandom().primaryKey(),
  incomingOrderId: uuid('incoming_order_id').references(() => incomingOrders.id),
  outgoingInvoiceId: uuid('outgoing_invoice_id').references(() => outgoingInvoices.id),
});

// ==========================================
// 2. OLAP SCHEMA (Data Warehouse - Sterschema)
// ==========================================

export const dimOrganization = olapSchema.table('dim_organization', {
  orgKey: integer('org_key').primaryKey(),
  orgId: uuid('org_id'), // Link naar OLTP
  name: varchar('name', { length: 255 }),
  vatNr: varchar('vat_nr', { length: 50 }),
  iban: varchar('iban', { length: 34 }),
});

export const dimDate = olapSchema.table('dim_date', {
  dateKey: integer('date_key').primaryKey(), // YYYYMMDD
  fullDate: date('full_date'),
  day: integer('day'),
  month: integer('month'),
  year: integer('year'),
  quarter: integer('quarter'),
  fiscalYear: integer('fiscal_year'),
  fiscalPeriod: varchar('fiscal_period', { length: 10 }),
  isPeriodClosed: boolean('is_period_closed').default(false),
});

export const dimTime = olapSchema.table('dim_time', {
  timeKey: integer('time_key').primaryKey(), // HHMMSS
  fullTime: time('full_time'),
  hour: integer('hour'),
  minute: integer('minute'),
  second: integer('second'),
});

export const dimVat = olapSchema.table('dim_vat', {
  vatKey: integer('vat_key').primaryKey(),
  vatCode: varchar('vat_code', { length: 10 }),
  vatRate: decimal('vat_rate', { precision: 5, scale: 2 }),
  taxBox: integer('tax_box'),
});

export const dimTransactionType = olapSchema.table('dim_transaction_type', {
  typeKey: integer('type_key').primaryKey(),
  transactionType: varchar('transaction_type', { length: 50 }), // INVOICE, CREDIT_NOTE
  journalSource: varchar('journal_source', { length: 50 }), // AANKOOP, BANK
  sourcePillar: varchar('source_pillar', { length: 20 }), // P1, P2...
  peppolStatus: varchar('peppol_status', { length: 50 }),
});

export const dimPartner = olapSchema.table('dim_partner', {
  partnerKey: integer('partner_key').primaryKey(),
  partnerId: uuid('partner_id'),
  name: varchar('name', { length: 255 }),
  vatNr: varchar('vat_nr', { length: 50 }),
  peppolId: varchar('peppol_id', { length: 100 }),
  email: varchar('email', { length: 255 }),
  iban: varchar('iban', { length: 34 }),
  isCustomer: boolean('is_customer'),
  isSupplier: boolean('is_supplier'),
});

export const dimLedgerAccount = olapSchema.table('dim_ledger_account', {
  ledgerKey: integer('ledger_key').primaryKey(),
  ledgerCode: integer('ledger_code'),
  ledgerName: varchar('ledger_name', { length: 100 }),
  category: varchar('category', { length: 50 }),
});

export const dimAnalytic = olapSchema.table('dim_analytic', {
  analyticKey: integer('analytic_key').primaryKey(),
  analyticCode: varchar('analytic_code', { length: 50 }),
  projectName: varchar('project_name', { length: 100 }),
});

export const dimDocument = olapSchema.table('dim_document', {
  documentKey: integer('document_key').primaryKey(),
  originalFileName: varchar('original_file_name', { length: 255 }),
  storagePath: varchar('storage_path', { length: 512 }),
  documentType: varchar('document_type', { length: 50 }),
  ocrConfidence: decimal('ocr_confidence'),
  isPeppol: boolean('is_peppol'),
});

export const dimAudit = olapSchema.table('dim_audit', {
  auditKey: integer('audit_key').primaryKey(),
  userId: uuid('user_id'),
  userRole: varchar('user_role', { length: 50 }),
  sourceSystem: varchar('source_system', { length: 50 }),
  entryTimestamp: timestamp('entry_timestamp'),
});

// --- FEITEN TABELLEN ---

export const factFinancialTransactions = olapSchema.table('fact_financial_transactions', {
  id: integer('id').primaryKey(),
  dateKey: integer('date_key').references(() => dimDate.dateKey),
  orgKey: integer('org_key').references(() => dimOrganization.orgKey),
  timeKey: integer('time_key').references(() => dimTime.timeKey),
  typeKey: integer('type_key').references(() => dimTransactionType.typeKey),
  partnerKey: integer('partner_key').references(() => dimPartner.partnerKey),
  ledgerKey: integer('ledger_key').references(() => dimLedgerAccount.ledgerKey),
  analyticKey: integer('analytic_key').references(() => dimAnalytic.analyticKey),
  vatKey: integer('vat_key').references(() => dimVat.vatKey),
  documentKey: integer('document_key').references(() => dimDocument.documentKey),
  auditKey: integer('audit_key').references(() => dimAudit.auditKey),
  
  amountDebet: decimal('amount_debet', { precision: 12, scale: 2 }),
  amountCredit: decimal('amount_credit', { precision: 12, scale: 2 }),
  netAmount: decimal('net_amount', { precision: 12, scale: 2 }),
  vatAmount: decimal('vat_amount', { precision: 12, scale: 2 }),
  dueDateKey: integer('due_date_key').references(() => dimDate.dateKey),
  isReconciled: boolean('is_reconciled'),
  
  pillarMatchId: uuid('pillar_match_id'),
  isMatched: boolean('is_matched'),
  matchConfidence: decimal('match_confidence'),
});

export const factBudgetPerformance = olapSchema.table('fact_budget_performance', {
  id: integer('id').primaryKey(),
  dateKey: integer('date_key').references(() => dimDate.dateKey),
  orgKey: integer('org_key').references(() => dimOrganization.orgKey),
  ledgerKey: integer('ledger_key').references(() => dimLedgerAccount.ledgerKey),
  analyticKey: integer('analytic_key').references(() => dimAnalytic.analyticKey),
  auditKey: integer('audit_key').references(() => dimAudit.auditKey),
  
  budgetAmount: decimal('budget_amount', { precision: 12, scale: 2 }),
  actualAmount: decimal('actual_amount', { precision: 12, scale: 2 }),
  variance: decimal('variance', { precision: 12, scale: 2 }),
});