// backend/src/drizzle/schema.ts
import { pgSchema, uuid, varchar, decimal, boolean, timestamp, date, integer, text, pgEnum, time, unique, jsonb } from 'drizzle-orm/pg-core';

// --- DEFINIEER DE SCHEMAS ---
export const oltpSchema = pgSchema('pepol_app');
export const olapSchema = pgSchema('pepol_dwh');

// ==========================================
// 1. OLTP SCHEMA (Pilaar 1 t/m 5)
// ==========================================

// ==========================================
// THEMA 0: FOUNDATION & AUTH (Organisatie & Gebruikers)
// ==========================================

export const organizations = oltpSchema.table('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  vat: varchar('vat', { length: 50 }),
  iban: varchar('iban', { length: 34 }), 
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

// ==========================================
// THEMA 1: STAMGEGEVENS (Dimensions)
// ==========================================

export const partners = oltpSchema.table('partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  isPeppolReady: boolean('is_peppol_ready').default(false).notNull(),
  preferredOrderChannel: varchar('preferred_order_channel', { length: 20 }).default('EMAIL').notNull(),
  preferredInvoiceChannel: varchar('preferred_invoice_channel', { length: 20 }).default('PEPPOL').notNull(),
  vat: varchar('vat_nr', { length: 50 }),
  peppolId: varchar('peppol_id', { length: 100 }),
  email: varchar('email', { length: 255 }),
  isCustomer: boolean('is_customer').default(false).notNull(),
  isSupplier: boolean('is_supplier').default(false).notNull(),
  bankAccountIban: varchar('bank_account_iban', { length: 34 }),
}, (table) => ({
  unqPartner: unique('partner_org_name_unq').on(table.orgId, table.name),
}));

export const products = oltpSchema.table('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  sku: varchar('sku', { length: 100 }), 
  name: varchar('name', { length: 255 }).notNull(),
  unit: varchar('unit', { length: 20 }).default('stuks'),
  active: boolean('active').default(true),
});

export const vatCodes = oltpSchema.table('vat_codes', {
  id: uuid('id').primaryKey().defaultRandom(), 
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  code: text('code').notNull(),
  rate: decimal('rate', { precision: 5, scale: 2 }).notNull(), 
  description: text('description'),
  taxDeclarationBox: integer('tax_declaration_box').notNull(),
}, (table) => ({
  unqVatCode: unique().on(table.orgId, table.code),
}));

export const analyticAccounts = oltpSchema.table('analytic_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  active: boolean('active').default(true).notNull(),
}, (table) => ({
  unqAnalyticCode: unique('analytic_org_code_unq').on(table.orgId, table.code),
}));

// ==========================================
// THEMA 2: INKOOP & VOORRAAD (Pilaar 1, 3 & 5)
// ==========================================

export const outgoingOrders = oltpSchema.table('outgoing_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  supplierId: uuid('supplier_id').references(() => partners.id).notNull(),
  orderNr: varchar('order_nr', { length: 100 }).notNull(),
  date: date('date').notNull(), 
  totalEstimated: decimal('total_estimated', { precision: 12, scale: 2 }), 
  channel: varchar('channel', { length: 50 }).notNull(), // PEPPOL, EMAIL
  status: varchar('status', { length: 30 }).default('DRAFT').notNull(), 
  fileHash: text('file_hash'), 
}, (table) => ({
  unqOutgoingOrderNr: unique('outgoing_order_nr_org_unq').on(table.orgId, table.orderNr),
}));

export const incomingInvoices = oltpSchema.table('incoming_invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  supplierId: uuid('supplier_id').references(() => partners.id).notNull(),
  invoiceNr: varchar('invoice_nr', { length: 100 }).notNull(),
  date: date('date').notNull(),
  dueDate: date('due_date'),
  currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
  totalExclVat: decimal('total_excl_vat', { precision: 12, scale: 2 }).notNull(),
  vatCodeId: uuid('vat_code_id').references(() => vatCodes.id).notNull(),
  status: varchar('status', { length: 30 }).default('PENDING').notNull(),
  isPeppol: boolean('is_peppol').default(false).notNull(),
  ocrConfidence: decimal('ocr_confidence'),
  rawFileStoragePath: varchar('raw_file_storage_path', { length: 255 }),
  fileHash: text('file_hash'),
  sepaExportId: uuid('sepa_export_id'),
}, (table) => ({
  unqIncomingInv: unique('incoming_inv_supplier_nr_unq').on(table.supplierId, table.invoiceNr),
}));

export const incomingInvoiceLines = oltpSchema.table('incoming_invoice_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id').references(() => incomingInvoices.id).notNull(),
  productId: uuid('product_id').references(() => products.id),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 12, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  vatCodeId: uuid('vat_code_id').references(() => vatCodes.id).notNull(),
  ledgerAccountId: uuid('ledger_account_id').references(() => ledgerAccounts.id),
});

export const inventoryMutations = oltpSchema.table('inventory_mutations', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  change: decimal('change', { precision: 12, scale: 2 }).notNull(), 
  valuation: decimal('valuation', { precision: 12, scale: 2 }).notNull(), 
  sourceType: varchar('source_type', { length: 50 }).notNull(), // "GOODS_RECEIPT" of "PURCHASE_INVOICE"
  sourceId: uuid('source_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// THEMA 3: VERKOOP (Pilaar 2 & 4)
// ==========================================

export const incomingOrders = oltpSchema.table('incoming_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  customerId: uuid('customer_id').references(() => partners.id).notNull(),
  orderNr: varchar('order_nr', { length: 100 }),
  date: date('date').notNull(), 
  source: varchar('source', { length: 50 }).notNull(), 
  referenceExt: varchar('reference_ext', { length: 255 }).notNull(),
  totalEstimated: decimal('total_estimated', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 30 }).default('RECEIVED').notNull(),
  aiSummary: text('ai_summary'),
  fileHash: text('file_hash'), 
}, (table) => ({
  unqIncomingOrder: unique('incoming_order_ref_unq').on(table.customerId, table.referenceExt),
}));

export const outgoingInvoices = oltpSchema.table('outgoing_invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  customerId: uuid('customer_id').references(() => partners.id).notNull(),
  invoiceNr: varchar('invoice_nr', { length: 100 }).notNull(),
  date: date('date').notNull(),
  dueDate: date('due_date'),
  currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
  totalExclVat: decimal('total_excl_vat', { precision: 12, scale: 2 }).notNull(), 
  vatCodeId: uuid('vat_code_id').references(() => vatCodes.id).notNull(),
  status: varchar('status', { length: 30 }).default('DRAFT').notNull(), 
  peppolStatus: varchar('peppol_status', { length: 30 }).default('NONE').notNull(), 
  rawFileStoragePath: varchar('raw_file_storage_path', { length: 255 }),
  fileHash: text('file_hash'), 
}, (table) => ({
  unqOutgoingInvNr: unique('outgoing_inv_nr_org_unq').on(table.orgId, table.invoiceNr),
}));

// ==========================================
// THEMA 4: SMART MATCHING & LOGS
// ==========================================

export const matchP5P1 = oltpSchema.table('match_p5_p1', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  outgoingOrderId: uuid('outgoing_order_id').references(() => outgoingOrders.id).notNull(),
  incomingInvoiceId: uuid('incoming_invoice_id').references(() => incomingInvoices.id).notNull(),
  matchConfidence: decimal('match_confidence', { precision: 3, scale: 2 }),
});

export const matchP2P4 = oltpSchema.table('match_p2_p4', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  incomingOrderId: uuid('incoming_order_id').references(() => incomingOrders.id).notNull(),
  outgoingInvoiceId: uuid('outgoing_invoice_id').references(() => outgoingInvoices.id).notNull(),
  matchConfidence: decimal('match_confidence', { precision: 3, scale: 2 }),
});

export const followUpLogs = oltpSchema.table('follow_up_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  matchP5P1Id: uuid('match_p5_p1_id').references(() => matchP5P1.id),
  matchP2P4Id: uuid('match_p2_p4_id').references(() => matchP2P4.id),
  userId: uuid('user_id').references(() => users.id).notNull(),
  actionTaken: text('action_taken').notNull(),
  statusAfterAction: varchar('status_after_action', { length: 50 }).notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// THEMA 5: ACCOUNTING (Journals, Ledger & Assets)
// ==========================================

export const journals = oltpSchema.table('journals', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  name: varchar('name').notNull(), 
  type: varchar('type').notNull(), // AANKOOP, VERKOOP, BANK, DIVERSEN
  code: varchar('code').notNull(), 
}, (table) => ({
  unqJournalCodePerOrg: unique('journal_org_code_unq').on(table.orgId, table.code),
}));

export const ledgerAccounts = oltpSchema.table('ledger_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  code: integer('code').notNull(), 
  name: varchar('name').notNull(),
  category: varchar('category').notNull(), // ASSET, LIABILITY, REVENUE, EXPENSE
}, (table) => ({
  unqLedgerCodePerOrg: unique('ledger_org_code_unq').on(table.orgId, table.code),
}));

export const journalEntries = oltpSchema.table('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  journalId: uuid('journal_id').references(() => journals.id).notNull(),
  date: date('date').notNull(),
  description: text('description').notNull(),
});

export const transactions = oltpSchema.table('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  entryId: uuid('entry_id').references(() => journalEntries.id).notNull(),
  ledgerId: uuid('ledger_id').references(() => ledgerAccounts.id).notNull(),
  vatCodeId: uuid('vat_code_id').references(() => vatCodes.id),
  analyticAccountId: uuid('analytic_account_id').references(() => analyticAccounts.id),
  debit: decimal('debit', { precision: 12, scale: 2 }).default('0.00').notNull(),
  credit: decimal('credit', { precision: 12, scale: 2 }).default('0.00').notNull(),
  isReconciled: boolean('is_reconciled').default(false).notNull(),
});

export const assets = oltpSchema.table('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  purchaseEntryId: uuid('purchase_entry_id').references(() => journalEntries.id).notNull(),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }).notNull(),
  depreciationMonths: integer('depreciation_months').notNull(),
  startDate: date('start_date').notNull(),
});

export const budgets = oltpSchema.table('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  ledgerCode: integer('ledger_code').notNull(),
  analyticAccountId: uuid('analytic_account_id').references(() => analyticAccounts.id),
  amountLimit: decimal('amount_limit', { precision: 12, scale: 2 }).notNull(),
  period: varchar('period', { length: 20 }).notNull(), 
});

// ==========================================
// THEMA 6: BANKING & RECONCILIATION
// ==========================================

export const bankStatements = oltpSchema.table('bank_statements', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  date: date('date').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  communication: text('communication'),
  counterpartyIban: varchar('counterparty_iban', { length: 34 }),
  bankReference: varchar('bank_reference', { length: 255 }), 
}, (table) => ({
  unqBankRef: unique('bank_ref_org_unq').on(table.orgId, table.bankReference),
}));

export const reconciliationLogs = oltpSchema.table('reconciliation_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  bankStatementId: uuid('bank_statement_id').references(() => bankStatements.id).notNull(),
  journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id).notNull(),
  transactionId: uuid('transaction_id').references(() => transactions.id).notNull(),
  matchType: varchar('match_type', { length: 20 }).notNull().default('MANUAL'), 
  reconciledAt: timestamp('reconciled_at').defaultNow().notNull(),
});

// ==========================================
// THEMA 7: GOVERNANCE (Dashboard, Audit & Periods)
// ==========================================

export const userDashboardConfigs = oltpSchema.table('user_dashboard_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  layout: jsonb('layout').notNull(), 
  theme: varchar('theme', { length: 20 }).default('glassmorphism'),
});

export const auditLogs = oltpSchema.table('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(), 
  entityType: varchar('entity_type', { length: 50 }).notNull(), 
  entityId: uuid('entity_id').notNull(),
  changes: jsonb('changes'), 
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const accountingPeriods = oltpSchema.table('accounting_periods', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 20 }).notNull(), 
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  lockedBy: uuid('locked_by').references(() => users.id),
  lockedAt: timestamp('locked_at'),
});

// backend/src/drizzle/schema.ts (OLAP Sectie)

// ==========================================
// 2. OLAP SCHEMA (Data Warehouse / Reporting)
// ==========================================

// --- DIMENSIES (De "Wie, Wat, Waar, Wanneer") ---

export const dimOrganization = olapSchema.table('dim_organization', {
  orgKey: integer('org_key').primaryKey(), 
  orgId: uuid('org_id').notNull(),         
  name: varchar('name', { length: 255 }).notNull(),
  vatNr: varchar('vat', { length: 50 }),
  iban: varchar('iban', { length: 34 }),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to'),
  isCurrent: boolean('is_current').default(true),
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

export const dimPartner = olapSchema.table('dim_partner', {
  partnerKey: integer('partner_key').primaryKey(),
  partnerId: uuid('partner_id').notNull(), 
  name: varchar('name', { length: 255 }).notNull(),
  vatNr: varchar('vat_nr', { length: 50 }),
  peppolId: varchar('peppol_id', { length: 100 }),
  isCustomer: boolean('is_customer').notNull(),
  isSupplier: boolean('is_supplier').notNull(),
  isPeppolReady: boolean('is_peppol_ready').notNull(),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to'),
  isCurrent: boolean('is_current').default(true),
});

export const dimProduct = olapSchema.table('dim_product', {
  productKey: integer('product_key').primaryKey(),
  productId: uuid('product_id').notNull(),
  sku: varchar('sku', { length: 100 }),
  name: varchar('name', { length: 255 }).notNull(),
  unit: varchar('unit', { length: 20 }),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to'),
  isCurrent: boolean('is_current').default(true),
});

export const dimLedgerAccount = olapSchema.table('dim_ledger_account', {
  ledgerKey: integer('ledger_key').primaryKey(),
  ledgerCode: integer('ledger_code').notNull(),
  ledgerName: varchar('ledger_name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // ASSET, LIABILITY, REVENUE, EXPENSE
});

export const dimAnalytic = olapSchema.table('dim_analytic', {
  analyticKey: integer('analytic_key').primaryKey(),
  analyticCode: varchar('analytic_code', { length: 50 }).notNull(),
  analyticName: varchar('analytic_name', { length: 100 }).notNull(),
});

export const dimDocument = olapSchema.table('dim_document', {
  documentKey: integer('document_key').primaryKey(),
  documentType: varchar('document_type', { length: 50 }).notNull(), // INVOICE, ORDER, CREDIT_NOTE
  sourcePillar: varchar('source_pillar', { length: 20 }).notNull(), // P1, P2, P4, P5
  statusAtLoad: varchar('status_at_load', { length: 50 }),          // Voor trend-analyse van statussen
  isPeppol: boolean('is_peppol').notNull(),
  fileHash: text('file_hash'),                                     // Fiscale integriteit in de DWH
});

// --- FEITEN TABELLEN (De "Hoeveel") ---

// Fact 1: Financiële Transacties (De motor voor Balans & P&L)
export const factFinancials = olapSchema.table('fact_financials', {
  id: integer('id').primaryKey(),
  orgKey: integer('org_key').references(() => dimOrganization.orgKey).notNull(),
  dateKey: integer('date_key').references(() => dimDate.dateKey).notNull(),
  partnerKey: integer('partner_key').references(() => dimPartner.partnerKey).notNull(),
  ledgerKey: integer('ledger_key').references(() => dimLedgerAccount.ledgerKey).notNull(),
  analyticKey: integer('analytic_key').references(() => dimAnalytic.analyticKey),
  documentKey: integer('document_key').references(() => dimDocument.documentKey),
  
  debit: decimal('debit', { precision: 12, scale: 2 }).notNull().default('0.00'),
  credit: decimal('credit', { precision: 12, scale: 2 }).notNull().default('0.00'),
  vatAmount: decimal('vat_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  
  isReconciled: boolean('is_reconciled').default(false),
  daysToPay: integer('days_to_pay'), // Voor Cashflow-analyse: (Betaaldatum - Factuurdatum)
});

// Fact 2: AI & Matching Performance (Voor het "AI Dashboard")
export const factMatchingPerformance = olapSchema.table('fact_matching_performance', {
  id: integer('id').primaryKey(),
  orgKey: integer('org_key').references(() => dimOrganization.orgKey).notNull(),
  dateKey: integer('date_key').references(() => dimDate.dateKey).notNull(),
  documentKey: integer('document_key').references(() => dimDocument.documentKey).notNull(),
  
  ocrConfidence: decimal('ocr_confidence', { precision: 3, scale: 2 }),
  matchConfidence: decimal('match_confidence', { precision: 3, scale: 2 }),
  isAutoMatched: boolean('is_auto_matched').notNull(), // Was er menselijke interventie nodig?
  processingTimeSeconds: integer('processing_time_seconds'), // Snelheid van de "Pillar Flow"
});

 // Fact 3: Voorraad & Product Analyse (Pilaar 5 Deep-dive)
export const factInventoryFlow = olapSchema.table('fact_inventory_flow', {
  id: integer('id').primaryKey(),
  orgKey: integer('org_key').references(() => dimOrganization.orgKey).notNull(),
  dateKey: integer('date_key').references(() => dimDate.dateKey).notNull(),
  productKey: integer('product_key').references(() => dimProduct.productKey).notNull(),
  
  quantityChange: decimal('quantity_change', { precision: 12, scale: 2 }).notNull(),
  valuationChange: decimal('valuation_change', { precision: 12, scale: 2 }).notNull(),
  stockLevelAfter: decimal('stock_level_after', { precision: 12, scale: 2 }).notNull(),
});

 // Fact 4: Budget vs Realisatie
export const factBudgetPerformance = olapSchema.table('fact_budget_performance', {
  id: integer('id').primaryKey(),
  orgKey: integer('org_key').references(() => dimOrganization.orgKey).notNull(),
  dateKey: integer('date_key').references(() => dimDate.dateKey).notNull(),
  ledgerKey: integer('ledger_key').references(() => dimLedgerAccount.ledgerKey).notNull(),
  analyticKey: integer('analytic_key').references(() => dimAnalytic.analyticKey),
  
  budgetAmount: decimal('budget_amount', { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal('actual_amount', { precision: 12, scale: 2 }).notNull(),
});

// --- WISSELKOERSEN (Voor globale rapportage) ---
export const factExchangeRates = olapSchema.table('fact_exchange_rates', {
  id: integer('id').primaryKey(),
  dateKey: integer('date_key').references(() => dimDate.dateKey).notNull(),
  fromCurrency: varchar('from_currency', { length: 3 }).notNull(), // USD, GBP
  toCurrency: varchar('to_currency', { length: 3 }).default('EUR').notNull(),
  rate: decimal('rate', { precision: 18, scale: 9 }).notNull(),
});

// --- ACCOUNTING BRIDGE (Voor complexe aflettering) ---
export const mapPaymentToInvoice = olapSchema.table('map_payment_to_invoice', {
  paymentDocumentKey: integer('payment_document_key').references(() => dimDocument.documentKey),
  invoiceDocumentKey: integer('invoice_document_key').references(() => dimDocument.documentKey),
  amountAllocated: decimal('amount_allocated', { precision: 12, scale: 2 }).notNull(),
});