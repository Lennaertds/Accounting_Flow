// backend/src/drizzle/schema.ts
import { relations } from 'drizzle-orm';
import { pgSchema, uuid, varchar, decimal, boolean, timestamp, date, integer, text, pgEnum, time, unique, jsonb, bigint } from 'drizzle-orm/pg-core';

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
// THEMA 2: BANKING & RECONCILIATION
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

export const sepaExports = oltpSchema.table('sepa_exports', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  filename: varchar('filename', { length: 255 }).notNull(), // Bijv: SEPA_20260331_001.xml
  fileStoragePath: varchar('file_storage_path', { length: 512 }), 
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  transactionCount: integer('transaction_count').notNull(),
  executionDate: date('execution_date').notNull(), // De gewenste datum van uitvoering bij de bank
  status: varchar('status', { length: 30 }).default('GENERATED').notNull(), // GENERATED, UPLOADED, PROCESSED, REJECTED
  bankBatchReference: varchar('bank_batch_reference', { length: 100 }), // Referentie vanuit de bankafschriften
});

// ==========================================
// THEMA 3: INKOOP & VOORRAAD (Pilaar 1, 3 & 5)
// ==========================================

export const quotations = oltpSchema.table('quotations', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  quotationNr: varchar('quotation_nr', { length: 100 }).notNull(),
  version: integer('version').default(1).notNull(),
  status: varchar('status', { length: 30 }).default('DRAFT'), // SENT, SIGNED, EXPIRED, CONVERTED
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  expiresAt: date('expires_at'),
  signatureData: text('signature_data'), // Voor e-signature metadata
}, (table) => ({
  unqQuot: unique('quotation_org_nr_ver_unq').on(table.orgId, table.quotationNr, table.version),
}));

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

export const outgoingOrderLines = oltpSchema.table('outgoing_order_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => outgoingOrders.id).notNull(),
  productId: uuid('product_id').references(() => products.id),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 12, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  vatCodeId: uuid('vat_code_id').references(() => vatCodes.id).notNull(),
});

export const goodsReceipts = oltpSchema.table('goods_receipts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  outgoingOrderId: uuid('outgoing_order_id').references(() => outgoingOrders.id).notNull(),
  receivedDate: timestamp('received_date').defaultNow().notNull(),
  receivedBy: uuid('received_by').references(() => users.id),
  deliveryNoteRef: varchar('delivery_note_ref', { length: 100 }), // De leverbon van de transporteur
});

export const goodsReceiptLines = oltpSchema.table('goods_receipt_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  receiptId: uuid('receipt_id').references(() => goodsReceipts.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  quantityReceived: decimal('quantity_received', { precision: 12, scale: 2 }).notNull(),
  condition: varchar('condition', { length: 50 }).default('GOOD'), // DAMAGED, MISSING, GOOD
});

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
  sepaExportId: uuid('sepa_export_id').references(() => sepaExports.id),
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
  valuation: decimal('valuation', { precision: 12, scale: 2 }).notNull(), // FIFO, LIFO OF GIP
  sourceType: varchar('source_type', { length: 50 }).notNull(), // "GOODS_RECEIPT" of "PURCHASE_INVOICE"
  sourceId: uuid('source_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// THEMA 4: VERKOOP (Pilaar 2 & 4)
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

export const incomingOrderLines = oltpSchema.table('incoming_order_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => incomingOrders.id).notNull(),
  productId: uuid('product_id').references(() => products.id),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 12, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  vatCodeId: uuid('vat_code_id').references(() => vatCodes.id).notNull(),
});

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

export const outgoingInvoiceLines = oltpSchema.table('outgoing_invoice_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id').references(() => outgoingInvoices.id).notNull(),
  productId: uuid('product_id').references(() => products.id),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 12, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  vatCodeId: uuid('vat_code_id').references(() => vatCodes.id).notNull(),
  ledgerAccountId: uuid('ledger_account_id').references(() => ledgerAccounts.id),
});

// ==========================================
// THEMA 5: ACCOUNTING & MATCHING
// ==========================================

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

export const matchP5P1 = oltpSchema.table('match_p5_p1', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  outgoingOrderId: uuid('outgoing_order_id').references(() => outgoingOrders.id).notNull(),
  incomingInvoiceId: uuid('incoming_invoice_id').references(() => incomingInvoices.id).notNull(),
  journalEntryId: uuid('journalEntryId').references(() => journalEntries.id),
  matchConfidence: decimal('match_confidence', { precision: 3, scale: 2 }),
});

export const matchP2P4 = oltpSchema.table('match_p2_p4', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  incomingOrderId: uuid('incoming_order_id').references(() => incomingOrders.id).notNull(),
  outgoingInvoiceId: uuid('outgoing_invoice_id').references(() => outgoingInvoices.id).notNull(),
  journalEntryId: uuid('journalEntryId').references(() => journalEntries.id),
  matchConfidence: decimal('match_confidence', { precision: 3, scale: 2 }),
});

export const reconciliationLogs = oltpSchema.table('reconciliation_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  bankStatementId: uuid('bank_statement_id').references(() => bankStatements.id).notNull(),
  journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id).notNull(),
  transactionId: uuid('transaction_id').references(() => transactions.id).notNull(),
  matchType: varchar('match_type', { length: 20 }).notNull().default('MANUAL'), 
  reconciledAt: timestamp('reconciled_at').defaultNow().notNull(),
});

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

export const assets = oltpSchema.table('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  purchaseEntryId: uuid('purchase_entry_id').references(() => journalEntries.id).notNull(),
  ledgerAccountId: uuid('ledger_account_id').references(() => ledgerAccounts.id),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }).notNull(),
  depreciationMonths: integer('depreciation_months').notNull(),
  startDate: date('start_date').notNull(),
});

export const budgets = oltpSchema.table('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  ledgerCode: integer('ledger_code').notNull().references(() => ledgerAccounts.id),
  analyticAccountId: uuid('analytic_account_id').references(() => analyticAccounts.id),
  amountLimit: decimal('amount_limit', { precision: 12, scale: 2 }).notNull(),
  period: varchar('period', { length: 20 }).notNull(), 
});

// ==========================================
// THEMA 6: GOVERNANCE & LOGS
// ==========================================

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

export const interactionLogs = oltpSchema.table('interaction_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  entityType: varchar('entity_type', { length: 50 }), // 'INVOICE', 'ORDER', 'QUOTATION'
  entityId: uuid('entity_id'),
  type: varchar('type', { length: 20 }).notNull(), // EMAIL, PHONE, SYSTEM_ALERT
  message: text('message').notNull(),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoiceDisputes = oltpSchema.table('invoice_disputes', {
  id: uuid('id').defaultRandom().primaryKey(),
  incomingInvoiceId: uuid('incoming_invoice_id').references(() => incomingInvoices.id),
  outgoingInvoiceId: uuid('outgoing_invoice_id').references(() => outgoingInvoices.id),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 20 }).default('OPEN'), // RESOLVED, CANCELLED
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userDashboardConfigs = oltpSchema.table('user_dashboard_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  layout: jsonb('layout').notNull(), 
  theme: varchar('theme', { length: 20 }).default('glassmorphism'),
});

// ==========================================
// 2. OLAP SCHEMA (Data Warehouse / Reporting)
// ==========================================

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
  timeKey: integer('time_key').primaryKey(),
  fullTime: time('full_time').notNull(), 
  hour: integer('hour').notNull(),      
  minute: integer('minute').notNull(), 
  second: integer('second').notNull(), 
});

// ==========================================
// THEMA 0: FOUNDATION & AUTH DIMENSIES
// ==========================================

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

export const dimUser = olapSchema.table('dim_user', {
  userKey: integer('user_key').primaryKey(),
  userId: uuid('user_id').notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 20 }),
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

export const dimVat = olapSchema.table('dim_vat', {
  vatKey: integer('vat_key').primaryKey(),
  vatId: uuid('vat_id').notNull(),
  code: text('code'),
  rate: decimal('rate', { precision: 5, scale: 2 }),
  taxBox: integer('tax_box'),
});

export const dimAnalytic = olapSchema.table('dim_analytic', {
  analyticKey: integer('analytic_key').primaryKey(),
  analyticId: uuid('analytic_id').notNull(),
  code: varchar('code', { length: 50 }),
  name: varchar('name', { length: 100 }),
  isActive: boolean('is_active'),
});

// ==========================================
// THEMA 1: BANKING & RECONCILIATION DIMENSIES
// ==========================================

export const dimBankStatement = olapSchema.table('dim_bank_statement', {
  bankStatementKey: integer('bank_statement_key').primaryKey(),
  statementId: uuid('statement_id').notNull(),
  orgId: uuid('org_id').notNull(),
  date: date('date').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  communication: text('communication'),
  counterpartyIban: varchar('counterparty_iban', { length: 34 }),
  bankReference: varchar('bank_reference', { length: 255 }),
});

export const dimSepaExport = olapSchema.table('dim_sepa_export', {
  sepaKey: integer('sepa_key').primaryKey(),
  sepaId: uuid('sepa_id').notNull(),
  orgId: uuid('org_id').notNull(),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at'),
  filename: varchar('filename', { length: 255 }),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }),
  executionDate: date('execution_date'),
  status: varchar('status', { length: 30 }),
});

// ==========================================
// THEMA 2: INKOOP & VOORRAAD DIMENSIES
// ==========================================

export const dimQuotation = olapSchema.table('dim_quotation', {
  quotationKey: integer('quotation_key').primaryKey(),
  quotationId: uuid('quotation_id').notNull(),
  orgId: uuid('org_id').notNull(),
  partnerId: uuid('partner_id'),
  quotationNr: varchar('quotation_nr'),
  version: integer('version'),
  status: varchar('status'),
});

export const dimOutgoingOrder = olapSchema.table('dim_outgoing_order', {
  outgoingOrderKey: integer('outgoing_order_key').primaryKey(),
  orderId: uuid('order_id').notNull(),
  orgId: uuid('org_id').notNull(),
  supplierId: uuid('supplier_id'),
  orderNr: varchar('order_nr'),
  status: varchar('status'),
});

export const dimGoodsReceipt = olapSchema.table('dim_goods_receipt', {
  goodsReceiptKey: integer('goods_receipt_key').primaryKey(),
  receiptId: uuid('receipt_id').notNull(),
  orgId: uuid('org_id').notNull(),
  outgoingOrderId: uuid('outgoing_order_id'),
  receivedBy: uuid('received_by'),
  deliveryNoteRef: varchar('delivery_note_ref'),
});

export const dimIncomingInvoice = olapSchema.table('dim_incoming_invoice', {
  incomingInvoiceKey: integer('incoming_invoice_key').primaryKey(),
  invoiceId: uuid('invoice_id').notNull(),
  supplierId: uuid('supplier_id'),
  invoiceNr: varchar('invoice_nr'),
  sepaExportId: uuid('sepa_export_id'),
  status: varchar('status'),
});

export const dimInventoryMutation = olapSchema.table('dim_inventory_mutation', {
  inventoryMutationKey: integer('inventory_mutation_key').primaryKey(),
  mutationId: uuid('mutation_id').notNull(),
  productId: uuid('product_id'),
  sourceType: varchar('source_type'),
  sourceId: uuid('source_id'),
  change: decimal('change', { precision: 12, scale: 2 }),
});

// ==========================================
// THEMA 3: VERKOOP DIMENSIES
// ==========================================

export const dimIncomingOrder = olapSchema.table('dim_incoming_order', {
  incomingOrderKey: integer('incoming_order_key').primaryKey(),
  orderId: uuid('order_id').notNull(),
  orgId: uuid('org_id').notNull(),
  customerId: uuid('customer_id'),
  orderNr: varchar('order_nr', { length: 100 }),
  date: date('date'),
  source: varchar('source', { length: 50 }),
  referenceExt: varchar('reference_ext', { length: 255 }),
  totalEstimated: decimal('total_estimated', { precision: 12, scale: 2 }),
  status: varchar('status', { length: 30 }),
  aiSummary: text('ai_summary'),
  fileHash: text('file_hash'),
});

// Let op: 'Lines' worden in OLAP vaak direct in de Fact-table gezet, 
// maar als je ze als dimensie wilt behouden voor specifieke filtering:
export const dimIncomingOrderLine = olapSchema.table('dim_incoming_order_line', {
  incomingOrderLineKey: integer('incoming_order_line_key').primaryKey(),
  lineId: uuid('line_id').notNull(),
  orderId: uuid('order_id').notNull(),
  productId: uuid('product_id'),
  description: text('description'),
  quantity: decimal('quantity', { precision: 12, scale: 2 }),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }),
});

export const dimOutgoingInvoice = olapSchema.table('dim_outgoing_invoice', {
  outgoingInvoiceKey: integer('outgoing_invoice_key').primaryKey(),
  invoiceId: uuid('invoice_id').notNull(),
  orgId: uuid('org_id').notNull(),
  customerId: uuid('customer_id'),
  invoiceNr: varchar('invoice_nr', { length: 100 }),
  date: date('date'),
  dueDate: date('due_date'),
  currency: varchar('currency', { length: 3 }),
  totalExclVat: decimal('total_excl_vat', { precision: 12, scale: 2 }),
  status: varchar('status', { length: 30 }),
  peppolStatus: varchar('peppol_status', { length: 30 }),
});

// ==========================================
// THEMA 4: ACCOUNTING & MATCHING DIMENSIES
// ==========================================

export const dimJournal = olapSchema.table('dim_journal', {
  journalKey: integer('journal_key').primaryKey(),
  journalId: uuid('journal_id').notNull(),
  orgId: uuid('org_id').notNull(),
  name: varchar('name'),
  type: varchar('type'),
  code: varchar('code'),
});

export const dimLedgerAccount = olapSchema.table('dim_ledger_account', {
  ledgerKey: integer('ledger_key').primaryKey(),
  ledgerId: uuid('ledger_id').notNull(),
  orgId: uuid('org_id').notNull(),
  code: integer('code'),
  name: varchar('name'),
  category: varchar('category'),
});

export const dimJournalEntry = olapSchema.table('dim_journal_entry', {
  entryKey: integer('entry_key').primaryKey(),
  entryId: uuid('entry_id').notNull(),
  journalId: uuid('journal_id'),
  date: date('date'),
  description: text('description'),
});

export const dimTransaction = olapSchema.table('dim_transaction', {
  transactionKey: integer('transaction_key').primaryKey(),
  transactionId: uuid('transaction_id').notNull(),
  entryId: uuid('entry_id'),
  ledgerId: uuid('ledger_id'),
  debit: decimal('debit', { precision: 12, scale: 2 }),
  credit: decimal('credit', { precision: 12, scale: 2 }),
  isReconciled: boolean('is_reconciled'),
});

export const dimMatchPurchase = olapSchema.table('dim_match_purchase', {
  matchPurchaseKey: integer('match_purchase_key').primaryKey(),
  matchId: uuid('match_id').notNull(),
  orgId: uuid('org_id').notNull(),
  outgoingOrderId: uuid('outgoing_order_id'),
  incomingInvoiceId: uuid('incoming_invoice_id'),
  journalEntryId: uuid('journal_entry_id'),
  matchConfidence: decimal('match_confidence', { precision: 3, scale: 2 }),
});

export const dimMatchSales = olapSchema.table('dim_match_sales', {
  matchSalesKey: integer('match_sales_key').primaryKey(),
  matchId: uuid('match_id').notNull(),
  orgId: uuid('org_id').notNull(),
  incomingOrderId: uuid('incoming_order_id'),
  outgoingInvoiceId: uuid('outgoing_invoice_id'),
  journalEntryId: uuid('journal_entry_id'),
  matchConfidence: decimal('match_confidence', { precision: 3, scale: 2 }),
});

export const dimReconciliationLog = olapSchema.table('dim_reconciliation_log', {
  reconciliationKey: integer('reconciliation_key').primaryKey(),
  logId: uuid('log_id').notNull(),
  orgId: uuid('org_id').notNull(),
  bankStatementId: uuid('bank_statement_id'),
  journalEntryId: uuid('journal_entry_id'),
  transactionId: uuid('transaction_id'),
  matchType: varchar('match_type'),
});

export const dimAsset = olapSchema.table('dim_asset', {
  assetKey: integer('asset_key').primaryKey(),
  assetId: uuid('asset_id').notNull(),
  orgId: uuid('org_id').notNull(),
  purchaseEntryId: uuid('purchase_entry_id'),
  ledgerAccountId: uuid('ledger_account_id'),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }),
  depreciationMonths: integer('depreciation_months'),
});

export const dimBudget = olapSchema.table('dim_budget', {
  budgetKey: integer('budget_key').primaryKey(),
  budgetId: uuid('budget_id').notNull(),
  orgId: uuid('org_id').notNull(),
  ledgerCodeId: uuid('ledger_code_id'),
  analyticAccountId: uuid('analytic_account_id'),
  amountLimit: decimal('amount_limit', { precision: 12, scale: 2 }),
  period: varchar('period'),
});

// ==========================================
// THEMA 5: GOVERNANCE & LOGS DIMENSIES
// ==========================================

export const dimAccountingPeriod = olapSchema.table('dim_accounting_period', {
  periodKey: integer('period_key').primaryKey(),
  periodId: uuid('period_id').notNull(),
  orgId: uuid('org_id').notNull(),
  name: varchar('name', { length: 20 }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  isLocked: boolean('is_locked'),
  lockedBy: uuid('locked_by'),
});

export const dimAuditLog = olapSchema.table('dim_audit_log', {
  auditKey: integer('audit_key').primaryKey(),
  logId: uuid('log_id').notNull(),
  orgId: uuid('org_id').notNull(),
  userId: uuid('user_id'),
  action: varchar('action', { length: 100 }),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  changes: jsonb('changes'),
  timestamp: timestamp('timestamp'),
});

export const dimFollowUpLog = olapSchema.table('dim_follow_up_log', {
  followUpKey: integer('follow_up_key').primaryKey(),
  logId: uuid('log_id').notNull(),
  orgId: uuid('org_id').notNull(),
  matchP5P1Id: uuid('match_p5_p1_id'),
  matchP2P4Id: uuid('match_p2_p4_id'),
  userId: uuid('user_id'),
  actionTaken: text('action_taken'),
  statusAfterAction: varchar('status_after_action', { length: 50 }),
});

export const dimInteractionLog = olapSchema.table('dim_interaction_log', {
  interactionKey: integer('interaction_key').primaryKey(),
  logId: uuid('log_id').notNull(),
  orgId: uuid('org_id').notNull(),
  partnerId: uuid('partner_id'),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  type: varchar('type', { length: 20 }),
  message: text('message'),
});

export const dimInvoiceDispute = olapSchema.table('dim_invoice_dispute', {
  disputeKey: integer('dispute_key').primaryKey(),
  disputeId: uuid('dispute_id').notNull(),
  incomingInvoiceId: uuid('incoming_invoice_id'),
  outgoingInvoiceId: uuid('outgoing_invoice_id'),
  reason: text('reason'),
  status: varchar('status', { length: 20 }),
});

export const dimUserDashboardConfig = olapSchema.table('dim_user_dashboard_config', {
  dashboardKey: integer('dashboard_key').primaryKey(),
  configId: uuid('config_id').notNull(),
  userId: uuid('user_id'),
  layout: jsonb('layout'),
  theme: varchar('theme', { length: 20 }),
});

// ==========================================
// FACT TABLES (Data Warehouse Meetwaarden)
// ==========================================

// --- THEMA 0: FOUNDATION & AUTH ---
export const factUserActivity = olapSchema.table('fact_user_activity', {
  activityKey: bigint('activity_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  userKey: integer('user_key').notNull(),
  dateKey: integer('date_key').notNull(), // YYYYMMDD
  timeKey: integer('time_key').notNull(),
  loginCount: integer('login_count').default(0),
  sessionDurationSeconds: integer('session_duration_seconds'),
  isActiveUser: boolean('is_active_user'),
  daysSinceRegistration: integer('days_since_registration'),
});

export const factPartnerStats = olapSchema.table('fact_partner_stats', {
  factKey: bigint('fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  partnerKey: integer('partner_key').notNull(),
  dateKey: integer('date_key').notNull(),
  isPeppolReady: boolean('is_peppol_ready'),
  isActiveCustomer: boolean('is_active_customer'),
  isActiveSupplier: boolean('is_active_supplier'),
  hasValidVat: boolean('has_valid_vat'),
  hasIban: boolean('has_iban'),
});

export const factProductCatalogStats = olapSchema.table('fact_product_catalog_stats', {
  factKey: bigint('fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  productKey: integer('product_key').notNull(),
  dateKey: integer('date_key').notNull(),
  isActive: boolean('is_active'),
  priceChangeCount: integer('price_change_count').default(0),
});

// --- THEMA 1: BANKING & CASHFLOW ---
export const factBankTransactions = olapSchema.table('fact_bank_transactions', {
  bankTransactionKey: bigint('bank_transaction_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  bankStatementKey: integer('bank_statement_key').notNull(),
  timeKey: integer('time_key'),
  statementAmount: decimal('statement_amount', { precision: 12, scale: 2 }),
  isPositiveCashflow: boolean('is_positive_cashflow'),
  isMatched: boolean('is_matched'),
});

export const factSepaPayments = olapSchema.table('fact_sepa_payments', {
  sepaPaymentKey: bigint('sepa_payment_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(), // ExecutionDate
  sepaKey: integer('sepa_key').notNull(),
  userKey: integer('user_key'),
  totalBatchAmount: decimal('total_batch_amount', { precision: 12, scale: 2 }),
  transactionCount: integer('transaction_count'),
  daysBetweenCreationAndExecution: integer('days_diff'),
});

export const factCashflowDailySnapshot = olapSchema.table('fact_cashflow_daily_snapshot', {
  snapshotKey: bigint('snapshot_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  dailyInflow: decimal('daily_inflow', { precision: 12, scale: 2 }),
  dailyOutflow: decimal('daily_outflow', { precision: 12, scale: 2 }),
  netCashflow: decimal('net_cashflow', { precision: 12, scale: 2 }),
});

// --- THEMA 2: INKOOP & LOGISTIEK ---
export const factPurchaseOperations = olapSchema.table('fact_purchase_operations', {
  purchaseFactKey: bigint('purchase_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  partnerKey: integer('partner_key').notNull(), // Supplier
  productKey: integer('product_key').notNull(),
  outgoingOrderKey: integer('outgoing_order_key'),
  incomingInvoiceKey: integer('incoming_invoice_key'),
  ledgerKey: integer('ledger_key'),
  orderedQuantity: decimal('ordered_quantity', { precision: 12, scale: 2 }),
  orderedUnitPrice: decimal('ordered_unit_price', { precision: 12, scale: 2 }),
  invoicedQuantity: decimal('invoiced_quantity', { precision: 12, scale: 2 }),
  invoicedAmountExclVat: decimal('invoiced_amount_excl_vat', { precision: 12, scale: 2 }),
  priceVariance: decimal('price_variance', { precision: 12, scale: 2 }),
});

export const factLogisticsPerformance = olapSchema.table('fact_logistics_performance', {
  logisticsFactKey: bigint('logistics_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  productKey: integer('product_key').notNull(),
  outgoingOrderKey: integer('outgoing_order_key'),
  goodsReceiptKey: integer('goods_receipt_key'),
  userKey: integer('user_key'), // ReceivedBy
  quantityOrdered: decimal('quantity_ordered', { precision: 12, scale: 2 }),
  quantityReceived: decimal('quantity_received', { precision: 12, scale: 2 }),
  quantityShortfall: decimal('quantity_shortfall', { precision: 12, scale: 2 }),
  isFullDelivery: boolean('is_full_delivery'),
});

export const factInventoryMutations = olapSchema.table('fact_inventory_mutations', {
  mutationFactKey: bigint('mutation_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  productKey: integer('product_key').notNull(),
  stockChangeQuantity: decimal('stock_change_quantity', { precision: 12, scale: 2 }),
  sourceType: varchar('source_type', { length: 50 }),
  sourceId: uuid('source_id'),
});

// --- THEMA 3: VERKOOP ---
export const factSalesOrders = olapSchema.table('fact_sales_orders', {
  salesOrderFactKey: bigint('sales_order_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  partnerKey: integer('partner_key').notNull(), // Customer
  productKey: integer('product_key').notNull(),
  incomingOrderKey: integer('incoming_order_key'),
  vatKey: integer('vat_key'),
  orderQuantity: decimal('order_quantity', { precision: 12, scale: 2 }),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }),
  estimatedLineTotal: decimal('estimated_line_total', { precision: 12, scale: 2 }),
  orderSource: varchar('order_source', { length: 50 }),
});

export const factSalesInvoices = olapSchema.table('fact_sales_invoices', {
  salesInvoiceFactKey: bigint('sales_invoice_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(), // InvoiceDate
  dueDateKey: integer('due_date_key'),
  partnerKey: integer('partner_key').notNull(), // Customer
  productKey: integer('product_key').notNull(),
  outgoingInvoiceKey: integer('outgoing_invoice_key'),
  ledgerKey: integer('ledger_key'),
  vatKey: integer('vat_key'),
  invoicedQuantity: decimal('invoiced_quantity', { precision: 12, scale: 2 }),
  invoicedUnitPrice: decimal('invoiced_unit_price', { precision: 12, scale: 2 }),
  lineAmountExclVat: decimal('line_amount_excl_vat', { precision: 12, scale: 2 }),
  daysToDue: integer('days_to_due'),
});

export const factSalesPerformance = olapSchema.table('fact_sales_performance', {
  salesPerfKey: bigint('sales_perf_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  partnerKey: integer('partner_key').notNull(),
  incomingOrderKey: integer('incoming_order_key'),
  outgoingInvoiceKey: integer('outgoing_invoice_key'),
  orderToInvoiceLeadTimeDays: integer('lead_time_days'),
  amountDifference: decimal('amount_difference', { precision: 12, scale: 2 }),
  isFullyInvoiced: boolean('is_fully_invoiced'),
});

// --- THEMA 4: ACCOUNTING & MATCHING ---
export const factGeneralLedger = olapSchema.table('fact_general_ledger', {
  ledgerFactKey: bigint('ledger_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  journalKey: integer('journal_key').notNull(),
  ledgerKey: integer('ledger_key').notNull(),
  entryKey: integer('entry_key').notNull(),
  transactionKey: integer('transaction_key').notNull(),
  debitAmount: decimal('debit_amount', { precision: 12, scale: 2 }).default('0.00'),
  creditAmount: decimal('credit_amount', { precision: 12, scale: 2 }).default('0.00'),
  netAmount: decimal('net_amount', { precision: 12, scale: 2 }), // Berekend: Debit - Credit
  isReconciled: boolean('is_reconciled').default(false),
});

export const factMatchingPerformance = olapSchema.table('fact_matching_performance', {
  matchFactKey: bigint('match_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  matchPurchaseKey: integer('match_purchase_key'), // Optioneel (P5-P1)
  matchSalesKey: integer('match_sales_key'),       // Optioneel (P2-P4)
  matchConfidence: decimal('match_confidence', { precision: 5, scale: 4 }),
  isAutoMatched: boolean('is_auto_matched'),
  manualCorrectionRequired: boolean('manual_correction_required').default(false),
});

export const factBudgetPerformance = olapSchema.table('fact_budget_performance', {
  budgetFactKey: bigint('budget_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(), // Start van de periode
  ledgerKey: integer('ledger_key').notNull(),
  budgetKey: integer('budget_key').notNull(),
  budgetLimit: decimal('budget_limit', { precision: 12, scale: 2 }),
  actualSpent: decimal('actual_spent', { precision: 12, scale: 2 }),
  budgetVariance: decimal('budget_variance', { precision: 12, scale: 2 }),
});

export const factAssetDepreciation = olapSchema.table('fact_asset_depreciation', {
  assetFactKey: bigint('asset_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  assetKey: integer('asset_key').notNull(),
  ledgerKey: integer('ledger_key').notNull(),
  initialValue: decimal('initial_value', { precision: 12, scale: 2 }),
  depreciationMonths: integer('depreciation_months'),
  monthlyDepreciationAmount: decimal('monthly_depreciation_amount', { precision: 12, scale: 2 }),
});

// --- THEMA 5: GOVERNANCE, AUDIT & AI FEEDBACK ---
export const factAuditMetrics = olapSchema.table('fact_audit_metrics', {
  auditFactKey: bigint('audit_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  userKey: integer('user_key').notNull(),
  auditKey: integer('audit_key').notNull(),
  actionCount: integer('action_count').default(1),
  isSensitiveAction: boolean('is_sensitive_action').default(false),
});

export const factAIFeedbackLoop = olapSchema.table('fact_ai_feedback_loop', {
  feedbackFactKey: bigint('feedback_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  userKey: integer('user_key').notNull(),
  followUpKey: integer('follow_up_key').notNull(),
  matchPurchaseKey: integer('match_purchase_key'),
  matchSalesKey: integer('match_sales_key'),
  manualCorrectionCount: integer('manual_correction_count').default(0),
  matchOverruled: boolean('match_overruled').default(false),
});

export const factInteractionVolume = olapSchema.table('fact_interaction_volume', {
  interactionFactKey: bigint('interaction_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(),
  partnerKey: integer('partner_key').notNull(),
  interactionKey: integer('interaction_key').notNull(),
  messageCount: integer('message_count').default(1),
  isExternalComm: boolean('is_external_comm'),
});

export const factDisputePerformance = olapSchema.table('fact_dispute_performance', {
  disputeFactKey: bigint('dispute_fact_key', { mode: 'number' }).primaryKey(),
  orgKey: integer('org_key').notNull(),
  dateKey: integer('date_key').notNull(), // Datum van opening
  partnerKey: integer('partner_key').notNull(),
  disputeKey: integer('dispute_key').notNull(),
  disputeCount: integer('dispute_count').default(1),
  isResolved: boolean('is_resolved').default(false),
  resolutionLeadTimeDays: integer('resolution_lead_time_days'),
});

// --- 1. Foundation & Auth Relaties ---
export const factUserActivityRelations = relations(factUserActivity, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factUserActivity.orgKey], references: [dimOrganization.orgKey] }),
  user: one(dimUser, { fields: [factUserActivity.userKey], references: [dimUser.userKey] }),
  date: one(dimDate, { fields: [factUserActivity.dateKey], references: [dimDate.dateKey] }),
  time: one(dimTime, { fields: [factUserActivity.timeKey], references: [dimTime.timeKey] }),
}));

export const factPartnerStatsRelations = relations(factPartnerStats, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factPartnerStats.orgKey], references: [dimOrganization.orgKey] }),
  partner: one(dimPartner, { fields: [factPartnerStats.partnerKey], references: [dimPartner.partnerKey] }),
  date: one(dimDate, { fields: [factPartnerStats.dateKey], references: [dimDate.dateKey] }),
}));

export const factProductCatalogStatsRelations = relations(factProductCatalogStats, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factProductCatalogStats.orgKey], references: [dimOrganization.orgKey] }),
  product: one(dimProduct, { fields: [factProductCatalogStats.productKey], references: [dimProduct.productKey] }),
  date: one(dimDate, { fields: [factProductCatalogStats.dateKey], references: [dimDate.dateKey] }),
}));

// --- 2. Banking & Cashflow Relaties ---
export const factBankTransactionsRelations = relations(factBankTransactions, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factBankTransactions.orgKey], references: [dimOrganization.orgKey] }),
  statement: one(dimBankStatement, { fields: [factBankTransactions.bankStatementKey], references: [dimBankStatement.bankStatementKey] }),
  date: one(dimDate, { fields: [factBankTransactions.dateKey], references: [dimDate.dateKey] }),
  time: one(dimTime, { fields: [factBankTransactions.timeKey], references: [dimTime.timeKey] }),
}));

export const factSepaPaymentsRelations = relations(factSepaPayments, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factSepaPayments.orgKey], references: [dimOrganization.orgKey] }),
  date: one(dimDate, { fields: [factSepaPayments.dateKey], references: [dimDate.dateKey] }),
  sepa: one(dimSepaExport, { fields: [factSepaPayments.sepaKey], references: [dimSepaExport.sepaKey] }),
  user: one(dimUser, { fields: [factSepaPayments.userKey], references: [dimUser.userKey] }),
}));

// --- 3. Inkoop & Voorraad (De Supply Chain) ---
export const factPurchaseOperationsRelations = relations(factPurchaseOperations, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factPurchaseOperations.orgKey], references: [dimOrganization.orgKey] }),
  supplier: one(dimPartner, { fields: [factPurchaseOperations.partnerKey], references: [dimPartner.partnerKey] }),
  product: one(dimProduct, { fields: [factPurchaseOperations.productKey], references: [dimProduct.productKey] }),
  order: one(dimOutgoingOrder, { fields: [factPurchaseOperations.outgoingOrderKey], references: [dimOutgoingOrder.outgoingOrderKey] }),
  invoice: one(dimIncomingInvoice, { fields: [factPurchaseOperations.incomingInvoiceKey], references: [dimIncomingInvoice.incomingInvoiceKey] }),
  ledger: one(dimLedgerAccount, { fields: [factPurchaseOperations.ledgerKey], references: [dimLedgerAccount.ledgerKey] }),
  date: one(dimDate, { fields: [factPurchaseOperations.dateKey], references: [dimDate.dateKey] }),
}));

export const factLogisticsPerformanceRelations = relations(factLogisticsPerformance, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factLogisticsPerformance.orgKey], references: [dimOrganization.orgKey] }),
  date: one(dimDate, { fields: [factLogisticsPerformance.dateKey], references: [dimDate.dateKey] }),
  product: one(dimProduct, { fields: [factLogisticsPerformance.productKey], references: [dimProduct.productKey] }),
  order: one(dimOutgoingOrder, { fields: [factLogisticsPerformance.outgoingOrderKey], references: [dimOutgoingOrder.outgoingOrderKey] }),
  receipt: one(dimGoodsReceipt, { fields: [factLogisticsPerformance.goodsReceiptKey], references: [dimGoodsReceipt.goodsReceiptKey] }),
  receiver: one(dimUser, { fields: [factLogisticsPerformance.userKey], references: [dimUser.userKey] }),
}));

export const factInventoryMutationsRelations = relations(factInventoryMutations, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factInventoryMutations.orgKey], references: [dimOrganization.orgKey] }),
  date: one(dimDate, { fields: [factInventoryMutations.dateKey], references: [dimDate.dateKey] }),
  product: one(dimProduct, { fields: [factInventoryMutations.productKey], references: [dimProduct.productKey] }),
}));

// --- 4. Verkoop & Omzet Relaties ---
export const factSalesOrdersRelations = relations(factSalesOrders, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factSalesOrders.orgKey], references: [dimOrganization.orgKey] }),
  date: one(dimDate, { fields: [factSalesOrders.dateKey], references: [dimDate.dateKey] }),
  customer: one(dimPartner, { fields: [factSalesOrders.partnerKey], references: [dimPartner.partnerKey] }),
  product: one(dimProduct, { fields: [factSalesOrders.productKey], references: [dimProduct.productKey] }),
  order: one(dimIncomingOrder, { fields: [factSalesOrders.incomingOrderKey], references: [dimIncomingOrder.incomingOrderKey] }),
  vat: one(dimVat, { fields: [factSalesOrders.vatKey], references: [dimVat.vatKey] }),
}));

export const factSalesInvoicesRelations = relations(factSalesInvoices, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factSalesInvoices.orgKey], references: [dimOrganization.orgKey] }),
  customer: one(dimPartner, { fields: [factSalesInvoices.partnerKey], references: [dimPartner.partnerKey] }),
  product: one(dimProduct, { fields: [factSalesInvoices.productKey], references: [dimProduct.productKey] }),
  invoice: one(dimOutgoingInvoice, { fields: [factSalesInvoices.outgoingInvoiceKey], references: [dimOutgoingInvoice.outgoingInvoiceKey] }),
  ledger: one(dimLedgerAccount, { fields: [factSalesInvoices.ledgerKey], references: [dimLedgerAccount.ledgerKey] }),
  vat: one(dimVat, { fields: [factSalesInvoices.vatKey], references: [dimVat.vatKey] }),
  date: one(dimDate, { fields: [factSalesInvoices.dateKey], references: [dimDate.dateKey] }),
}));

export const factSalesPerformanceRelations = relations(factSalesPerformance, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factSalesPerformance.orgKey], references: [dimOrganization.orgKey] }),
  date: one(dimDate, { fields: [factSalesPerformance.dateKey], references: [dimDate.dateKey] }),
  customer: one(dimPartner, { fields: [factSalesPerformance.partnerKey], references: [dimPartner.partnerKey] }),
  incomingOrder: one(dimIncomingOrder, { fields: [factSalesPerformance.incomingOrderKey], references: [dimIncomingOrder.incomingOrderKey] }),
  outgoingInvoice: one(dimOutgoingInvoice, { fields: [factSalesPerformance.outgoingInvoiceKey], references: [dimOutgoingInvoice.outgoingInvoiceKey] }),
}));

// --- 5. Accounting, Assets & Budget ---
export const factGeneralLedgerRelations = relations(factGeneralLedger, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factGeneralLedger.orgKey], references: [dimOrganization.orgKey] }),
  journal: one(dimJournal, { fields: [factGeneralLedger.journalKey], references: [dimJournal.journalKey] }),
  ledger: one(dimLedgerAccount, { fields: [factGeneralLedger.ledgerKey], references: [dimLedgerAccount.ledgerKey] }),
  entry: one(dimJournalEntry, { fields: [factGeneralLedger.entryKey], references: [dimJournalEntry.entryKey] }),
  transaction: one(dimTransaction, { fields: [factGeneralLedger.transactionKey], references: [dimTransaction.transactionKey] }),
  date: one(dimDate, { fields: [factGeneralLedger.dateKey], references: [dimDate.dateKey] }),
}));

export const factBudgetPerformanceRelations = relations(factBudgetPerformance, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factBudgetPerformance.orgKey], references: [dimOrganization.orgKey] }),
  date: one(dimDate, { fields: [factBudgetPerformance.dateKey], references: [dimDate.dateKey] }),
  ledger: one(dimLedgerAccount, { fields: [factBudgetPerformance.ledgerKey], references: [dimLedgerAccount.ledgerKey] }),
  budget: one(dimBudget, { fields: [factBudgetPerformance.budgetKey], references: [dimBudget.budgetKey] }),
}));

export const factAssetDepreciationRelations = relations(factAssetDepreciation, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factAssetDepreciation.orgKey], references: [dimOrganization.orgKey] }),
  asset: one(dimAsset, { fields: [factAssetDepreciation.assetKey], references: [dimAsset.assetKey] }),
  ledger: one(dimLedgerAccount, { fields: [factAssetDepreciation.ledgerKey], references: [dimLedgerAccount.ledgerKey] }),
}));

// --- 6. AI Performance & Feedback ---
export const factMatchingPerformanceRelations = relations(factMatchingPerformance, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factMatchingPerformance.orgKey], references: [dimOrganization.orgKey] }),
  matchPurchase: one(dimMatchPurchase, { fields: [factMatchingPerformance.matchPurchaseKey], references: [dimMatchPurchase.matchPurchaseKey] }),
  matchSales: one(dimMatchSales, { fields: [factMatchingPerformance.matchSalesKey], references: [dimMatchSales.matchSalesKey] }),
  date: one(dimDate, { fields: [factMatchingPerformance.dateKey], references: [dimDate.dateKey] }),
}));

export const factAIFeedbackLoopRelations = relations(factAIFeedbackLoop, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factAIFeedbackLoop.orgKey], references: [dimOrganization.orgKey] }),
  date: one(dimDate, { fields: [factAIFeedbackLoop.dateKey], references: [dimDate.dateKey] }),
  user: one(dimUser, { fields: [factAIFeedbackLoop.userKey], references: [dimUser.userKey] }),
  followUp: one(dimFollowUpLog, { fields: [factAIFeedbackLoop.followUpKey], references: [dimFollowUpLog.followUpKey] }),
}));

// --- 7. Governance, Logs & Disputes ---
export const factAuditMetricsRelations = relations(factAuditMetrics, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factAuditMetrics.orgKey], references: [dimOrganization.orgKey] }),
  date: one(dimDate, { fields: [factAuditMetrics.dateKey], references: [dimDate.dateKey] }),
  user: one(dimUser, { fields: [factAuditMetrics.userKey], references: [dimUser.userKey] }),
  auditLog: one(dimAuditLog, { fields: [factAuditMetrics.auditKey], references: [dimAuditLog.auditKey] }),
}));

export const factInteractionVolumeRelations = relations(factInteractionVolume, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factInteractionVolume.orgKey], references: [dimOrganization.orgKey] }),
  date: one(dimDate, { fields: [factInteractionVolume.dateKey], references: [dimDate.dateKey] }),
  partner: one(dimPartner, { fields: [factInteractionVolume.partnerKey], references: [dimPartner.partnerKey] }),
  log: one(dimInteractionLog, { fields: [factInteractionVolume.interactionKey], references: [dimInteractionLog.interactionKey] }),
}));

export const factDisputePerformanceRelations = relations(factDisputePerformance, ({ one }) => ({
  organization: one(dimOrganization, { fields: [factDisputePerformance.orgKey], references: [dimOrganization.orgKey] }),
  partner: one(dimPartner, { fields: [factDisputePerformance.partnerKey], references: [dimPartner.partnerKey] }),
  dispute: one(dimInvoiceDispute, { fields: [factDisputePerformance.disputeKey], references: [dimInvoiceDispute.disputeKey] }),
  date: one(dimDate, { fields: [factDisputePerformance.dateKey], references: [dimDate.dateKey] }),
}));