# OLAP Sterschema (Dimensional Model)
### 🔍 PlantUML (Sterschema Visualisatie)
![Sterschema Fact Constellation](https://kroki.io/plantuml/svg/eNqlV9tuGzcQfddXEH6JU0itpcR9KIIgsi6o6ljaSrKBPhk0dyyz5pICl2tESfrvHV604t4coH1QsjNnyT0zPDNDf8oN1abIRO-Jp0AY10xAL3_mck81zYjgEsxhD2SvxMEaESZVCjnsya8XkVNT-Wydw9FFrwfScHMgZ1OerfSOSv6VGq7kGaE5SXl2r_SOfOsR8hNB-BoO5DfCpSEfPiTXHz-ifzDAfxBaTBG5vV1M0VzSDNB6oZo9UX0-urx8i947apY6cl9eWO_igcrI-e79294_FVZTaqBkk6IR6Fh_F595IYTFEbQr0DOl4U18vlHSPJXWX0B1afxZYKrhZM95zqiovOJdCWiu0oj40EeTe2AiVA4WflBKAJW1mLY8O8Vk0AgxWf9rMVkcQbsCPb-r4kTrhsvCBezNDTAl02BWP47nUH77hZrwafR2fRmhCeoIsY3RXO68ax3yC4xnVJxf9kc2AVv65Up9af3uFnWXU2bVtUW5nuK32g3x42MXi9ryqpDI-WJ5t1pMZn0yWc-mi-39crVFAwz72dL6A1Mlqdjgf6yxdDxeXq9WSZ_czdb-4Qo9fTJdoGNjl_t1CReCxgoe2dXJsE-SEf7e4e89_pzYE9hjOW4MNUVe_95MPoMgL0ppXPBLMqorPkENStBlgvbeDjkKaFeaAvxfy9HzdqtPynbILKNcNLdZYK5q9WvLYFLkRmWuko4lYN2bYr8XvOKuxv4Z0h3oMWOqkCeZCucNCfCvdMXv0aBXXwveVctCiGqCKt4pfaglokpqjNI5GM5KPjQ4AqMj3sXpiAdWtYxr9Tcw00av1ggVKzKIspKqI4Ej1N2f-Y4jiTkX0K6GjVGa7iChrjOWDIeuqI_bN-vO7j1Z30-UfMTZJF1tPQpFTeiFVkydZz0uUn6KhlrrmFD73BXMbV6Vt7XXuH-Dma_azSE3kDXAmTT6YPspTtdsHwaFa6wRyTn2mzkmTjJORdSAcsf6EY17Y70dI2mOTSQwb4zPClbv-_MSqDXEEmjpAiXWLJASalNqCdZGQOlvU9dpx_pRzWPhZ7aMp_AAJhoVw5GfFR6daLAH34SXYPwbLRhS7cSmBTQPwnFa5Gs7FhlWQVppTG-Q7oDcUMOecL6Rz2rHGbU-W5-u6zusVB1xmzlfbSfnaymHmqiuCjwig3eFR6UzlBecBPXgoP-rqDYNRHC7DuIXXjtWz77zAMbMFFS8cnaaU5-bKoQ5ekPWIPACCnnvePn8_n0wUN-iYuuVF8EGhFueRWXq0nfWKy9ZP3zf3ct-sD_KK97XtsR2isex3Y6GkdYOlvOlHba3to60qK41vr02sdY8ew22JyLCWmKI0NYgYrzBKICfQKb4586_VDUFDA==)

### PlantUML Broncode
```
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

package "0 Foudation en Auth Dimensies"{
    entity "DimOrganization" as d_org {
        * OrgKey : int [PK]
        --
        OrgID : uuid (Bron: org.id)
        Name : varchar(255)
        VatNr : varchar(50)
        Iban : varchar(34)
    }

    entity "DimUser" as d_user {
        * UserKey : int [PK]
        --
        UserID : uuid (Bron: user.id)
        FirstName : varchar(255)
        LastName : varchar(255)
        Email : varchar(255)
        Role : varchar(20)
    }

    entity "DimPartner" as d_partner {
        * PartnerKey : int [PK]
        --
        PartnerID : uuid (Bron: partner.id)
        Name : varchar(255)
        VatNr : varchar(50)
        PeppolID : varchar(100)
        Email : varchar(255)
        Iban : varchar(34)
        IsCustomer : boolean
        IsSupplier : boolean
        PreferredOrderChannel : varchar(20)
        PreferredInvoiceChannel : varchar(20)
    }

    entity "DimProduct" as d_prod {
        * ProductKey : int [PK]
        --
        ProductID : uuid (Bron: prod.id)
        SKU : varchar(100)
        Name : varchar(255)
        Unit : varchar(20)
        IsActive : boolean
    }

    entity "DimVat" as d_vat {
        * VatKey : int [PK]
        --
        VatID : uuid (Bron: vat.id)
        Code : text
        Rate : decimal(5,2)
        TaxBox : integer
    }

    entity "DimAnalytic" as d_analytic {
        * AnalyticKey : int [PK]
        --
        AnalyticID : uuid (Bron: analytic.id)
        Code : varchar(50)
        Name : varchar(100)
        IsActive : boolean
    }
}

package "1 Banking & Reconciliation Dimensies"{

    entity "DimBankStatement" as d_bank {
        * BankStatementKey : int [PK]
        --
        ' Technisch / Audit
        StatementID : uuid (Bron: id)
        OrgID : uuid
        ' Attributen
        Date : date
        Amount : decimal(12,2)
        Communication : text
        CounterpartyIban : varchar(34)
        BankReference : varchar(255)
    }

    entity "DimSepaExport" as d_sepa {
        * SepaKey : int [PK]
        --
        ' Technisch / Audit
        SepaID : uuid (Bron: id)
        OrgID : uuid
        CreatedBy : uuid
        CreatedAt : timestamp
        ' Attributen
        Filename : varchar(255)
        FileStoragePath : varchar(512)
        TotalAmount : decimal(12,2)
        TransactionCount : integer
        ExecutionDate : date
        Status : varchar(30)
        BankBatchReference : varchar(100)
    }
}

package "2 Inkoop & Voorraad Dimensies"{

    entity "DimQuotation" as d_quot {
        * QuotationKey : int [PK]
        --
        QuotationID : uuid (Bron: id)
        OrgID : uuid
        PartnerID : uuid
        QuotationNr : varchar
        Version : integer
        Status : varchar
    }

    entity "DimOutgoingOrder" as d_out_ord {
        * OutgoingOrderKey : int [PK]
        --
        OrderID : uuid (Bron: id)
        OrgID : uuid
        SupplierID : uuid
        OrderNr : varchar
        Status : varchar
    }

    entity "DimOutgoingOrderLine" as d_out_ord_l {
        * OutgoingOrderLineKey : int [PK]
        --
        LineID : uuid (Bron: id)
        OrderID : uuid
        ProductID : uuid
        Quantity : decimal
        UnitPrice : decimal
    }

    entity "DimGoodsReceipt" as d_receipt {
        * GoodsReceiptKey : int [PK]
        --
        ReceiptID : uuid (Bron: id)
        OrgID : uuid
        OutgoingOrderID : uuid
        ReceivedBy : uuid
        DeliveryNoteRef : varchar
    }

    entity "DimGoodsReceiptLine" as d_receipt_l {
        * GoodsReceiptLineKey : int [PK]
        --
        LineID : uuid (Bron: id)
        ReceiptID : uuid
        ProductID : uuid
        QuantityReceived : decimal
    }

    entity "DimIncomingInvoice" as d_inc_inv {
        * IncomingInvoiceKey : int [PK]
        --
        InvoiceID : uuid (Bron: id)
        SupplierID : uuid
        InvoiceNr : varchar
        SepaExportID : uuid
        Status : varchar
    }

    entity "DimIncomingInvoiceLine" as d_inc_inv_l {
        * IncomingInvoiceLineKey : int [PK]
        --
        LineID : uuid (Bron: id)
        InvoiceID : uuid
        ProductID : uuid
        LedgerAccountID : uuid
    }

    entity "DimInventoryMutation" as d_inv_mut {
        * InventoryMutationKey : int [PK]
        --
        MutationID : uuid (Bron: id)
        ProductID : uuid
        SourceType : varchar
        SourceID : uuid
        Change : decimal
    }
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

package "5 Governance & Logs Dimensies"{

    entity "DimAccountingPeriod" as d_period {
        * PeriodKey : int [PK]
        --
        PeriodID : uuid (Bron: id)
        OrgID : uuid
        Name : varchar(20)
        StartDate : date
        EndDate : date
        IsLocked : boolean
        LockedBy : uuid
    }

    entity "DimAuditLog" as d_audit {
        * AuditKey : int [PK]
        --
        LogID : uuid (Bron: id)
        OrgID : uuid
        UserID : uuid
        Action : varchar(100)
        EntityType : varchar(50)
        EntityID : uuid
        Changes : jsonb
        Timestamp : timestamp
    }

    entity "DimFollowUpLog" as d_follow {
        * FollowUpKey : int [PK]
        --
        LogID : uuid (Bron: id)
        OrgID : uuid
        MatchP5P1ID : uuid
        MatchP2P4ID : uuid
        UserID : uuid
        ActionTaken : text
        StatusAfterAction : varchar(50)
    }

    entity "DimInteractionLog" as d_interact {
        * InteractionKey : int [PK]
        --
        LogID : uuid (Bron: id)
        OrgID : uuid
        PartnerID : uuid
        EntityType : varchar(50)
        EntityID : uuid
        Type : varchar(20)
        Message : text
    }

    entity "DimInvoiceDispute" as d_dispute {
        * DisputeKey : int [PK]
        --
        DisputeID : uuid (Bron: id)
        IncomingInvoiceID : uuid
        OutgoingInvoiceID : uuid
        Reason : text
        Status : varchar(20)
    }

    entity "DimUserDashboardConfig" as d_dash {
        * DashboardKey : int [PK]
        --
        ConfigID : uuid (Bron: id)
        UserID : uuid
        Layout : jsonb
        Theme : varchar(20)
    }
}

package "Facttables"{
    entity "FactUserActivity" as f_auth {
        * ActivityKey : bigint [PK]
        --
        ' Foreign Keys naar Dimensies
        * OrgKey : int [FK]
        * UserKey : int [FK]
        * DateKey : int [FK]
        * TimeKey : int [FK]
        --
        ' Measures (Meubilair van de fact)
        LoginCount : int
        SessionDurationSeconds : int
        IsActiveUser : boolean
        ' Voor groei-analyse
        DaysSinceRegistration : int
    }

    entity "FactPartnerStats" as f_partner_stats {
        * FactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * PartnerKey : int [FK]
        * DateKey : int [FK]
        --
        IsPeppolReady : boolean
        IsActiveCustomer : boolean
        IsActiveSupplier : boolean
        ' Voor kwaliteitsmeting:
        HasValidVat : boolean
        HasIban : boolean
    }

    entity "FactProductCatalogStats" as f_prod_stats {
        * FactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * ProductKey : int [FK]
        * DateKey : int [FK]
        --
        IsActive : boolean
        ' Voor analytics:
        PriceChangeCount : int
    }

    entity "FactDimensionHealth" as f_dim_health {
        * FactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK]
        --
        TotalPartners : int
        TotalProducts : int
        TotalAnalyticAccounts : int
        PeppolAdoptionRate : decimal(5,2)
    }

    entity "FactBankTransactions" as f_bank_trans {
        * BankTransactionKey : bigint [PK]
        --
        ' Foreign Keys naar Dimensies
        * OrgKey : int [FK]
        * DateKey : int [FK]
        * BankStatementKey : int [FK]
        * TimeKey : int [FK]
        --
        ' Measures uit bank_statements
        StatementAmount : decimal(12,2)
        ' Berekende metrieken voor analytics
        IsPositiveCashflow : boolean
        IsMatched : boolean (Bron: recon_log link)
    }

    entity "FactSepaPayments" as f_sepa_payments {
        * SepaPaymentKey : bigint [PK]
        --
        ' Foreign Keys naar Dimensies
        * OrgKey : int [FK]
        * DateKey : int [FK] (ExecutionDate)
        * SepaKey : int [FK]
        * UserKey : int [FK] (CreatedBy)
        --
        ' Measures uit sepa_exports
        TotalBatchAmount : decimal(12,2)
        TransactionCount : int
        ' Performance metriek
        DaysBetweenCreationAndExecution : int
    }

    entity "FactCashflowDailySnapshot" as f_cash_snap {
        * SnapshotKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK]
        --
        DailyInflow : decimal(12,2)
        DailyOutflow : decimal(12,2)
        NetCashflow : decimal(12,2)
    }

    entity "FactPurchaseOperations" as f_purchase {
        * PurchaseFactKey : bigint [PK]
        --
        ' Dimensie Koppelingen (FKs)
        * OrgKey : int [FK]
        * DateKey : int [FK]
        * PartnerKey : int [FK] (Supplier)
        * ProductKey : int [FK]
        * OutgoingOrderKey : int [FK]
        * IncomingInvoiceKey : int [FK]
        * LedgerKey : int [FK]
        --
        ' Measures uit out_ord_l & inc_inv_l
        OrderedQuantity : decimal
        OrderedUnitPrice : decimal
        InvoicedQuantity : decimal
        InvoicedAmountExclVat : decimal
        ' Afgeleide KPI
        PriceVariance : decimal (Order vs Factuur)
    }

    entity "FactLogisticsPerformance" as f_logistics {
        * LogisticsFactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK]
        * ProductKey : int [FK]
        * OutgoingOrderKey : int [FK]
        * GoodsReceiptKey : int [FK]
        * UserKey : int [FK] (ReceivedBy)
        --
        ' Measures uit receipt_l & out_ord_l
        QuantityOrdered : decimal
        QuantityReceived : decimal
        ' KPI's
        QuantityShortfall : decimal
        IsFullDelivery : boolean
    }

    entity "FactInventoryMutations" as f_inv_mut {
        * MutationFactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK]
        * ProductKey : int [FK]
        --
        ' Measures uit inv_mut
        StockChangeQuantity : decimal
        ' Context via Degenerate Dimensions
        SourceType : varchar (Receipt, Invoice, Adjustment)
        SourceID : uuid
    }

    entity "FactSalesOrders" as f_sales_orders {
        * SalesOrderFactKey : bigint [PK]
        --
        ' Dimensie Koppelingen (FKs)
        * OrgKey : int [FK]
        * DateKey : int [FK]
        * PartnerKey : int [FK] (Customer)
        * ProductKey : int [FK]
        * IncomingOrderKey : int [FK]
        * VatKey : int [FK]
        --
        ' Measures uit inc_ord & inc_ord_l
        OrderQuantity : decimal
        UnitPrice : decimal
        EstimatedLineTotal : decimal
        ' Meta-data voor analytics
        OrderSource : varchar(50)
    }

    entity "FactSalesInvoices" as f_sales_invoices {
        * SalesInvoiceFactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK] (InvoiceDate)
        * DueDateKey : int [FK]
        * PartnerKey : int [FK] (Customer)
        * ProductKey : int [FK]
        * OutgoingInvoiceKey : int [FK]
        * LedgerKey : int [FK]
        * VatKey : int [FK]
        --
        ' Measures uit out_inv & out_inv_l
        InvoicedQuantity : decimal
        InvoicedUnitPrice : decimal
        LineAmountExclVat : decimal
        ' Berekende metriek voor cashflow
        DaysToDue : int
    }

    entity "FactSalesPerformance" as f_sales_perf {
        * SalesPerfKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK]
        * PartnerKey : int [FK]
        * IncomingOrderKey : int [FK]
        * OutgoingInvoiceKey : int [FK]
        --
        ' KPI's (Verschil tussen Order en Factuur)
        OrderToInvoiceLeadTimeDays : int
        AmountDifference : decimal
        IsFullyInvoiced : boolean
    }

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
        ' Measures uit transactions
        DebitAmount : decimal(12,2)
        CreditAmount : decimal(12,2)
        NetAmount : decimal(12,2) (Debit - Credit)
        IsReconciled : boolean
    }

    entity "FactMatchingPerformance" as f_match {
        * MatchFactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK]
        * MatchPurchaseKey : int [FK] (opt)
        * MatchSalesKey : int [FK] (opt)
        --
        ' Measures uit match_p5_p1 & match_p2_p4
        MatchConfidence : decimal(5,4)
        IsAutoMatched : boolean (Confidence > drempelwaarde)
        ' Voor analytics:
        ManualCorrectionRequired : boolean
    }

    entity "FactBudgetPerformance" as f_budget {
        * BudgetFactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK] (Period Start)
        * LedgerKey : int [FK]
        * BudgetKey : int [FK]
        --
        ' Measures uit budgets vs werkelijkheid
        BudgetLimit : decimal(12,2)
        ActualSpent : decimal(12,2) (Lookup uit FactGeneralLedger)
        BudgetVariance : decimal(12,2)
    }

    entity "FactAssetDepreciation" as f_assets {
        * AssetFactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * AssetKey : int [FK]
        * LedgerKey : int [FK]
        --
        ' Measures uit assets
        InitialValue : decimal(12,2)
        DepreciationMonths : int
        MonthlyDepreciationAmount : decimal(12,2)
    }

    entity "FactAuditMetrics" as f_audit {
        * AuditFactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK]
        * UserKey : int [FK]
        * AuditKey : int [FK]
        --
        ' Measures uit audit_logs
        ActionCount : int
        ' Berekende metriek voor risico-analyse
        IsSensitiveAction : boolean (bv. Delete, Force Lock)
    }

    entity "FactAIFeedbackLoop" as f_ai_feedback {
        * FeedbackFactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK]
        * UserKey : int [FK]
        * FollowUpKey : int [FK]
        * MatchPurchaseKey : int [FK] (opt)
        * MatchSalesKey : int [FK] (opt)
        --
        ' Measures uit follow_up_logs
        ManualCorrectionCount : int
        ' KPI: Hoe vaak wijkt de mens af van de AI?
        MatchOverruled : boolean
    }

    entity "FactInteractionVolume" as f_interact {
        * InteractionFactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK]
        * PartnerKey : int [FK]
        * InteractionKey : int [FK]
        --
        ' Measures uit interaction_logs
        MessageCount : int
        ' Context
        IsExternalComm : boolean (bv. naar Partner)
    }

    entity "FactDisputePerformance" as f_disputes {
        * DisputeFactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK] (Opened)
        * PartnerKey : int [FK]
        * DisputeKey : int [FK]
        --
        ' Measures uit invoice_disputes
        DisputeCount : int
        ' KPI's
        IsResolved : boolean
        ResolutionLeadTimeDays : int
    }
}

' --- RELATIES PER FACT TABLE GROEP ---

' 1. Foundation & Master Data Facts
f_auth --> d_org : OrgKey
f_auth --> d_user : UserKey
f_auth --> dim_date : DateKey
f_auth --> dim_time : TimeKey

f_partner_stats --> d_org
f_partner_stats --> d_partner
f_partner_stats --> dim_date

f_prod_stats --> d_org
f_prod_stats --> d_prod
f_prod_stats --> dim_date

f_dim_health --> d_org
f_dim_health --> dim_date

' 2. Banking & Cashflow
f_bank_trans --> d_org
f_bank_trans --> dim_date
f_bank_trans --> d_bank
f_bank_trans --> dim_time

f_sepa_payments --> d_org
f_sepa_payments --> dim_date
f_sepa_payments --> d_sepa
f_sepa_payments --> d_user

f_cash_snap --> d_org
f_cash_snap --> dim_date

' 3. Inkoop & Voorraad (De "Supply Chain")
f_purchase --> d_org
f_purchase --> dim_date
f_purchase --> d_partner
f_purchase --> d_prod
f_purchase --> d_out_ord
f_purchase --> d_inc_inv
f_purchase --> d_ledger

f_logistics --> d_org
f_logistics --> dim_date
f_logistics --> d_prod
f_logistics --> d_out_ord
f_logistics --> d_receipt
f_logistics --> d_user

f_inv_mut --> d_org
f_inv_mut --> dim_date
f_inv_mut --> d_prod
f_inv_mut --> d_inv_mut

' 4. Verkoop & Omzet
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

f_sales_perf --> d_org
f_sales_perf --> dim_date
f_sales_perf --> d_partner
f_sales_perf --> d_inc_ord
f_sales_perf --> d_out_inv

' 5. Accounting & AI Matching
f_gl --> d_org
f_gl --> dim_date
f_gl --> d_jour
f_gl --> d_ledger
f_gl --> d_entry
f_gl --> d_trans

f_match --> d_org
f_match --> dim_date
f_match --> d_match_p1
f_match --> d_match_p4

f_budget --> d_org
f_budget --> dim_date
f_budget --> d_ledger
f_budget --> d_budget

f_assets --> d_org
f_assets --> d_asset
f_assets --> d_ledger

' 6. Governance, Logs & Disputes
f_audit --> d_org
f_audit --> dim_date
f_audit --> d_user
f_audit --> d_audit

f_ai_feedback --> d_org
f_ai_feedback --> dim_date
f_ai_feedback --> d_user
f_ai_feedback --> d_follow
f_ai_feedback --> d_match_p1
f_ai_feedback --> d_match_p4

f_interact --> d_org
f_interact --> dim_date
f_interact --> d_partner
f_interact --> d_interact

f_disputes --> d_org
f_disputes --> dim_date
f_disputes --> d_partner
f_disputes --> d_dispute

@enduml
```
