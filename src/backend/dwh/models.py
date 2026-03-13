# src/backend/dwh/models.py
from sqlalchemy import Column, String, Integer, Decimal, ForeignKey, DateTime, Date, Float, Boolean, Time
from src.backend.shared.database import BaseOLAP

# --- DIMENSIONS ---

class DimOrganization(BaseOLAP):
    __tablename__ = "dim_organization"
    __table_args__ = {"schema": "pepol_dwh"}
    org_key = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(String)  # Referentie naar Core UUID
    name = Column(String(255))
    vat_nr = Column(String(50))
    iban = Column(String(34))

class DimDate(BaseOLAP):
    __tablename__ = "dim_date"
    __table_args__ = {"schema": "pepol_dwh"}
    date_key = Column(Integer, primary_key=True)  # Formaat: YYYYMMDD
    full_date = Column(Date)
    day = Column(Integer)
    month = Column(Integer)
    year = Column(Integer)
    quarter = Column(Integer)
    fiscal_year = Column(Integer)
    fiscal_period = Column(String(10))
    is_period_closed = Column(Boolean, default=False)

class DimTime(BaseOLAP):
    __tablename__ = "dim_time"
    __table_args__ = {"schema": "pepol_dwh"}
    time_key = Column(Integer, primary_key=True)  # Formaat: HHMMSS
    full_time = Column(Time)
    hour = Column(Integer)
    minute = Column(Integer)
    second = Column(Integer)

class DimVat(BaseOLAP):
    __tablename__ = "dim_vat"
    __table_args__ = {"schema": "pepol_dwh"}
    vat_key = Column(Integer, primary_key=True, autoincrement=True)
    vat_code = Column(String(50))
    vat_rate = Column(Decimal(5, 2))
    tax_box = Column(Integer)

class DimTransactionType(BaseOLAP):
    __tablename__ = "dim_transaction_type"
    __table_args__ = {"schema": "pepol_dwh"}
    type_key = Column(Integer, primary_key=True, autoincrement=True)
    transaction_type = Column(String(50))  # INVOICE, CREDIT_NOTE, etc.
    journal_source = Column(String(50))    # AANKOOP, VERKOOP, etc.
    source_pillar = Column(String(20))     # P1, P2, P3, P4, P5
    peppol_status = Column(String(50))     # Enkel voor P2/P4

class DimPartner(BaseOLAP):
    __tablename__ = "dim_partner"
    __table_args__ = {"schema": "pepol_dwh"}
    partner_key = Column(Integer, primary_key=True, autoincrement=True)
    partner_id = Column(String)  # Referentie naar Core UUID
    name = Column(String(255))
    vat_nr = Column(String(50))
    peppol_id = Column(String(100))
    email = Column(String(255))
    iban = Column(String(34))
    is_customer = Column(Boolean)
    is_supplier = Column(Boolean)

class DimLedgerAccount(BaseOLAP):
    __tablename__ = "dim_ledger_account"
    __table_args__ = {"schema": "pepol_dwh"}
    ledger_key = Column(Integer, primary_key=True, autoincrement=True)
    ledger_code = Column(Integer)
    ledger_name = Column(String(100))
    category = Column(String(50))

class DimAnalytic(BaseOLAP):
    __tablename__ = "dim_analytic"
    __table_args__ = {"schema": "pepol_dwh"}
    analytic_key = Column(Integer, primary_key=True, autoincrement=True)
    analytic_code = Column(String(50))
    project_name = Column(String(100))

class DimDocument(BaseOLAP):
    __tablename__ = "dim_document"
    __table_args__ = {"schema": "pepol_dwh"}
    document_key = Column(Integer, primary_key=True, autoincrement=True)
    original_file_name = Column(String(255))
    storage_path = Column(String(512))
    document_type = Column(String(50))
    ocr_confidence = Column(Float)
    is_peppol = Column(Boolean)

class DimAudit(BaseOLAP):
    __tablename__ = "dim_audit"
    __table_args__ = {"schema": "pepol_dwh"}
    audit_key = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String)  # UUID referentie
    user_role = Column(String(50))
    source_system = Column(String(50))
    entry_timestamp = Column(DateTime)

# --- FACTS ---

class FactFinancialTransactions(BaseOLAP):
    __tablename__ = "fact_financial_transactions"
    __table_args__ = {"schema": "pepol_dwh"}
    
    # Composite PK & FKs
    date_key = Column(Integer, ForeignKey("pepol_dwh.dim_date.date_key"), primary_key=True)
    org_key = Column(Integer, ForeignKey("pepol_dwh.dim_organization.org_key"), primary_key=True)
    time_key = Column(Integer, ForeignKey("pepol_dwh.dim_time.time_key"))
    type_key = Column(Integer, ForeignKey("pepol_dwh.dim_transaction_type.type_key"))
    partner_key = Column(Integer, ForeignKey("pepol_dwh.dim_partner.partner_key"))
    ledger_key = Column(Integer, ForeignKey("pepol_dwh.dim_ledger_account.ledger_key"))
    analytic_key = Column(Integer, ForeignKey("pepol_dwh.dim_analytic.analytic_key"))
    vat_key = Column(Integer, ForeignKey("pepol_dwh.dim_vat.vat_key"))
    document_key = Column(Integer, ForeignKey("pepol_dwh.dim_document.document_key"))
    audit_key = Column(Integer, ForeignKey("pepol_dwh.dim_audit.audit_key"))
    
    # Measures
    amount_debet = Column(Decimal(12, 2))
    amount_credit = Column(Decimal(12, 2))
    net_amount = Column(Decimal(12, 2))
    vat_amount = Column(Decimal(12, 2))
    
    # Extra Info
    due_date_key = Column(Integer, ForeignKey("pepol_dwh.dim_date.date_key"))
    is_reconciled = Column(Boolean)
    pillar_match_id = Column(String)  # UUID referentie naar matching triggers
    is_matched = Column(Boolean)
    match_confidence = Column(Float)

class FactBudgetPerformance(BaseOLAP):
    __tablename__ = "fact_budget_performance"
    __table_args__ = {"schema": "pepol_dwh"}
    
    date_key = Column(Integer, ForeignKey("pepol_dwh.dim_date.date_key"), primary_key=True)
    org_key = Column(Integer, ForeignKey("pepol_dwh.dim_organization.org_key"), primary_key=True)
    ledger_key = Column(Integer, ForeignKey("pepol_dwh.dim_ledger_account.ledger_key"), primary_key=True)
    analytic_key = Column(Integer, ForeignKey("pepol_dwh.dim_analytic.analytic_key"), primary_key=True)
    audit_key = Column(Integer, ForeignKey("pepol_dwh.dim_audit.audit_key"))
    
    budget_amount = Column(Decimal(12, 2))
    actual_amount = Column(Decimal(12, 2))
    variance = Column(Decimal(12, 2))