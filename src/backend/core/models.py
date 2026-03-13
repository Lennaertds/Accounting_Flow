# src/backend/core/models.py
from sqlalchemy import Column, String, Integer, Decimal, Boolean, ForeignKey, DateTime, Date, Enum, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from src.backend.shared.database import BaseOLTP

# --- USER & AUTH ---
class User(BaseOLTP):
    __tablename__ = "users"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String) # ADMIN, ACCOUNTANT, VIEWER
    last_login = Column(DateTime)
    org_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.organizations.id"))

class Organization(BaseOLTP):
    __tablename__ = "organizations"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    my_vat_nr = Column(String)
    my_iban = Column(String)
    created_at = Column(DateTime, server_default=func.now())

# --- DIMENSIONS (Shared Data) ---
class Partner(BaseOLTP):
    __tablename__ = "partners"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.organizations.id"))
    name = Column(String, nullable=False)
    vat_nr = Column(String)
    peppol_id = Column(String)
    email = Column(String)
    is_customer = Column(Boolean, default=False)
    is_supplier = Column(Boolean, default=False)
    bank_account_iban = Column(String)

class VatCode(BaseOLTP):
    __tablename__ = "vat_codes"
    __table_args__ = {"schema": "pepol_app"}
    code = Column(String, primary_key=True)
    rate = Column(Decimal(5, 2))
    description = Column(String)
    tax_declaration_box = Column(Integer)

class AnalyticAccount(BaseOLTP):
    __tablename__ = "analytic_accounts"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.organizations.id"))
    name = Column(String)
    code = Column(String)
    active = Column(Boolean, default=True)

# --- PILAAR 1: Inkomende Facturen (Leveranciers) ---
class IncomingInvoice(BaseOLTP):
    __tablename__ = "incoming_invoices"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.organizations.id"))
    type = Column(String) # INVOICE, CREDIT_NOTE
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.partners.id"))
    invoice_nr = Column(String)
    date = Column(Date)
    total_excl_vat = Column(Decimal(12, 2))
    vat_code_id = Column(String, ForeignKey("pepol_app.vat_codes.code"))
    ocr_confidence = Column(Float)
    status = Column(String) # PENDING, MATCHED, DISCREPANCY, CANCELLED
    is_peppol = Column(Boolean, default=False)

# --- PILAAR 2: Inkomende Bestellingen (Klanten) ---
class IncomingOrder(BaseOLTP):
    __tablename__ = "incoming_orders"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.organizations.id"))
    customer_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.partners.id"))
    source = Column(String) # PLATFORM, PEPPOL, EMAIL_AI
    reference_ext = Column(String)
    total_estimated = Column(Decimal(12, 2))
    raw_input_path = Column(String)
    ai_summary = Column(Text)

# --- PILAAR 3: Het Grootboek (Core) ---
class Journal(BaseOLTP):
    __tablename__ = "journals"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.organizations.id"))
    name = Column(String)
    type = Column(String) # AANKOOP, VERKOOP, BANK, DIVERS
    code = Column(String)

class JournalEntry(BaseOLTP):
    __tablename__ = "journal_entries"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    journal_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.journals.id"))
    date = Column(Date)
    description = Column(String)

class LedgerAccount(BaseOLTP):
    __tablename__ = "ledger_accounts"
    __table_args__ = {"schema": "pepol_app"}
    code = Column(Integer, primary_key=True)
    name = Column(String)
    category = Column(String) # ASSET, LIABILITY, REVENUE, EXPENSE

class Transaction(BaseOLTP):
    __tablename__ = "transactions"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.journal_entries.id"))
    ledger_code = Column(Integer, ForeignKey("pepol_app.ledger_accounts.code"))
    analytic_account_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.analytic_accounts.id"), nullable=True)
    amount = Column(Decimal(12, 2))
    is_reconciled = Column(Boolean, default=False)

class Asset(BaseOLTP):
    __tablename__ = "assets"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    purchase_entry_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.journal_entries.id"))
    total_value = Column(Decimal(12, 2))
    depreciation_months = Column(Integer)
    start_date = Column(Date)

class Budget(BaseOLTP):
    __tablename__ = "budgets"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ledger_code = Column(Integer, ForeignKey("pepol_app.ledger_accounts.code"))
    analytic_account_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.analytic_accounts.id"))
    amount_limit = Column(Decimal(12, 2))
    period = Column(String)

# --- PILAAR 4: Uitgaande Facturen (Klanten) ---
class OutgoingInvoice(BaseOLTP):
    __tablename__ = "outgoing_invoices"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.organizations.id"))
    customer_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.partners.id"))
    invoice_nr = Column(String)
    vat_code_id = Column(String, ForeignKey("pepol_app.vat_codes.code"))
    peppol_status = Column(String) # DRAFT, SENT, PAID, CANCELLED

class FollowUpLog(BaseOLTP):
    __tablename__ = "follow_up_log"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.outgoing_invoices.id"))
    sent_at = Column(DateTime, server_default=func.now())
    type = Column(String) # REMINDER_1, REMINDER_2

# --- PILAAR 5: Uitgaande Bestellingen (Leveranciers) ---
class OutgoingOrder(BaseOLTP):
    __tablename__ = "outgoing_orders"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.organizations.id"))
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.partners.id"))
    channel = Column(String) # EMAIL, PEPPOL, PLATFORM
    status = Column(String) # ORDERED, RECEIVED, INVOICED

# --- BANKING ---
class BankStatement(BaseOLTP):
    __tablename__ = "bank_statements"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.organizations.id"))
    date = Column(Date)
    amount = Column(Decimal(12, 2))
    communication = Column(String)
    counterparty_iban = Column(String)

# --- AUTOMATISATIE TRIGGERS ---
class MatchP5P1(BaseOLTP):
    __tablename__ = "match_p5_p1"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    outgoing_order_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.outgoing_orders.id"))
    incoming_invoice_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.incoming_invoices.id"))

class MatchP2P4(BaseOLTP):
    __tablename__ = "match_p2_p4"
    __table_args__ = {"schema": "pepol_app"}
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incoming_order_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.incoming_orders.id"))
    outgoing_invoice_id = Column(UUID(as_uuid=True), ForeignKey("pepol_app.outgoing_invoices.id"))