@startuml
hide circle
skinparam linetype polyline
skinparam nodesep 60
skinparam ranksep 120

entity "DimDate" as dim_date {
  * DateKey : int <<PK>>
  --
  FullDate : date
  Day : int
  Month : int
  Year : int
  Quarter : int
  FiscalYear : int
  FiscalPeriod : varchar(10)
  IsPeriodClosed : boolean
}

entity "DimTime" as dim_time {
  * TimeKey : int <<PK>>
  --
  FullTime : time
  Hour : int
  Minute : int
  Second : int
}

package "3 Verkoop Dimensies"{

    entity "DimIncomingOrder" as d_inc_ord {
        * IncomingOrderKey : int [PK]
        --
        OrderID : uuid (Bron: id)
        OrgID : uuid
        CustomerID : uuid
        OrderNr : varchar(100)
        Date : date
        Source : varchar(50)
        ReferenceExt : varchar(255)
        TotalEstimated : decimal
        Status : varchar(30)
        AiSummary : text
        FileHash : text
    }

    entity "DimIncomingOrderLine" as d_inc_ord_l {
        * IncomingOrderLineKey : int [PK]
        --
        LineID : uuid (Bron: id)
        OrderID : uuid
        ProductID : uuid
        Description : text
        Quantity : decimal
        UnitPrice : decimal
        VatCodeID : uuid
    }

    entity "DimOutgoingInvoice" as d_out_inv {
        * OutgoingInvoiceKey : int [PK]
        --
        InvoiceID : uuid (Bron: id)
        OrgID : uuid
        CustomerID : uuid
        InvoiceNr : varchar(100)
        Date : date
        DueDate : date
        Currency : varchar(3)
        TotalExclVat : decimal
        VatCodeID : uuid
        Status : varchar(30)
        PeppolStatus : varchar(30)
        FileHash : text
    }

    entity "DimOutgoingInvoiceLine" as d_out_inv_l {
        * OutgoingInvoiceLineKey : int [PK]
        --
        LineID : uuid (Bron: id)
        InvoiceID : uuid
        ProductID : uuid
        Description : text
        Quantity : decimal
        UnitPrice : decimal
        VatCodeID : uuid
        LedgerAccountID : uuid
    }
}

package "4 Accounting & Matching Dimensies"{

    entity "DimJournal" as d_jour {
        * JournalKey : int [PK]
        --
        JournalID : uuid (Bron: id)
        OrgID : uuid
        Name : varchar
        Type : varchar
        Code : varchar
    }

    entity "DimLedgerAccount" as d_ledger {
        * LedgerKey : int [PK]
        --
        LedgerID : uuid (Bron: id)
        OrgID : uuid
        Code : integer
        Name : varchar
        Category : varchar
    }

    entity "DimJournalEntry" as d_entry {
        * EntryKey : int [PK]
        --
        EntryID : uuid (Bron: id)
        JournalID : uuid
        Date : date
        Description : text
    }

    entity "DimTransaction" as d_trans {
        * TransactionKey : int [PK]
        --
        TransactionID : uuid (Bron: id)
        EntryID : uuid
        LedgerID : uuid
        Debit : decimal
        Credit : decimal
        IsReconciled : boolean
    }

    entity "DimMatchPurchase" as d_match_p1 {
        * MatchPurchaseKey : int [PK]
        --
        MatchID : uuid (Bron: id)
        OrgID : uuid
        OutgoingOrderID : uuid
        IncomingInvoiceID : uuid
        JournalEntryID : uuid
        MatchConfidence : decimal
    }

    entity "DimMatchSales" as d_match_p4 {
        * MatchSalesKey : int [PK]
        --
        MatchID : uuid (Bron: id)
        OrgID : uuid
        IncomingOrderID : uuid
        OutgoingInvoiceID : uuid
        JournalEntryID : uuid
        MatchConfidence : decimal
    }

    entity "DimReconciliationLog" as d_recon {
        * ReconciliationKey : int [PK]
        --
        LogID : uuid (Bron: id)
        OrgID : uuid
        BankStatementID : uuid
        JournalEntryID : uuid
        TransactionID : uuid
        MatchType : varchar
    }

    entity "DimAsset" as d_asset {
        * AssetKey : int [PK]
        --
        AssetID : uuid (Bron: id)
        OrgID : uuid
        PurchaseEntryID : uuid
        LedgerAccountID : uuid
        TotalValue : decimal
        DepreciationMonths : integer
    }

    entity "DimBudget" as d_budget {
        * BudgetKey : int [PK]
        --
        BudgetID : uuid (Bron: id)
        OrgID : uuid
        LedgerCodeID : uuid
        AnalyticAccountID : uuid
        AmountLimit : decimal
        Period : varchar
    }
}

' --- Verkoop & Omzet Facts ---
entity "FactSalesOrders" as f_sales_orders {
    * SalesOrderFactKey : bigint [PK]
    --
    * OrgKey : int [FK]
    * DateKey : int [FK]
    * PartnerKey : int [FK]
    * ProductKey : int [FK]
    * IncomingOrderKey : int [FK]
    * VatKey : int [FK]
    --
    OrderQuantity : decimal
    EstimatedLineTotal : decimal
}

entity "FactSalesInvoices" as f_sales_invoices {
    * SalesInvoiceFactKey : bigint [PK]
    --
    * OrgKey : int [FK]
    * DateKey : int [FK]
    * DueDateKey : int [FK]
    * PartnerKey : int [FK]
    * OutgoingInvoiceKey : int [FK]
    * LedgerKey : int [FK]
    --
    InvoicedQuantity : decimal
    LineAmountExclVat : decimal
}

' --- Financial & AI Matching Facts ---
entity "FactGeneralLedger" as f_gl {
    * LedgerFactKey : bigint [PK]
    --
    * OrgKey : int [FK]
    * DateKey : int [FK]
    * JournalKey : int [FK]
    * LedgerKey : int [FK]
    * EntryKey : int [FK]
    * TransactionKey : int [FK]
    --
    DebitAmount : decimal
    CreditAmount : decimal
    NetAmount : decimal
}

entity "FactMatchingPerformance" as f_match {
    * MatchFactKey : bigint [PK]
    --
    * OrgKey : int [FK]
    * DateKey : int [FK]
    * MatchPurchaseKey : int [FK]
    * MatchSalesKey : int [FK]
    --
    MatchConfidence : decimal
    IsAutoMatched : boolean
}

entity "FactBudgetPerformance" as f_budget {
    * BudgetFactKey : bigint [PK]
    --
    * OrgKey : int [FK]
    * DateKey : int [FK]
    * LedgerKey : int [FK]
    * BudgetKey : int [FK]
    --
    BudgetLimit : decimal
    ActualSpent : decimal
}

entity "FactAssetDepreciation" as f_assets {
    * AssetFactKey : bigint [PK]
    --
    * OrgKey : int [FK]
    * AssetKey : int [FK]
    * LedgerKey : int [FK]
    --
    MonthlyDepreciationAmount : decimal
}

' --- RELATIES PER FACT TABLE ---

' Sales & Invoices
f_sales_orders --> d_org
f_sales_orders --> dim_date
f_sales_orders --> d_partner
f_sales_orders --> d_prod
f_sales_orders --> d_inc_ord
f_sales_orders --> d_vat

f_sales_invoices --> d_org
f_sales_invoices --> dim_date
f_sales_invoices --> d_partner
f_sales_invoices --> d_prod
f_sales_invoices --> d_out_inv
f_sales_invoices --> d_ledger
f_sales_invoices --> d_vat

' Accounting Heart
f_gl --> d_org
f_gl --> dim_date
f_gl --> d_jour
f_gl --> d_ledger
f_gl --> d_entry
f_gl --> d_trans

' AI Matching Performance
f_match --> d_org
f_match --> dim_date
f_match --> d_match_p1
f_match --> d_match_p4

' Budgets & Assets
f_budget_fact --> d_org
f_budget_fact --> dim_date
f_budget_fact --> d_ledger
f_budget_fact --> d_budget

f_assets_fact --> d_org
f_assets_fact --> d_asset
f_assets_fact --> d_ledger

@enduml