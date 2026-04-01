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

entity "FactAuditMetrics" as f_audit_fact {
    * AuditFactKey : bigint [PK]
    --
    * OrgKey : int [FK]
    * DateKey : int [FK]
    * UserKey : int [FK]
    * AuditKey : int [FK]
    --
    ActionCount : int
    IsSensitiveAction : boolean
}

entity "FactAIFeedbackLoop" as f_ai_feedback {
    * FeedbackFactKey : bigint [PK]
    --
    * OrgKey : int [FK]
    * DateKey : int [FK]
    * UserKey : int [FK]
    * FollowUpKey : int [FK]
    --
    ManualCorrectionCount : int
    MatchOverruled : boolean
}

entity "FactInteractionVolume" as f_interact_fact {
    * InteractionFactKey : bigint [PK]
    --
    * OrgKey : int [FK]
    * DateKey : int [FK]
    * PartnerKey : int [FK]
    * InteractionKey : int [FK]
    --
    MessageCount : int
    IsExternalComm : boolean
}

entity "FactDisputePerformance" as f_disputes_fact {
    * DisputeFactKey : bigint [PK]
    --
    * OrgKey : int [FK]
    * DateKey : int [FK]
    * PartnerKey : int [FK]
    * DisputeKey : int [FK]
    --
    DisputeCount : int
    IsResolved : boolean
    ResolutionLeadTimeDays : int
}

' --- RELATIES PER FACT TABLE ---

' Banking & Cashflow
f_bank_trans --> d_org
f_bank_trans --> dim_date
f_bank_trans --> dim_time
f_bank_trans --> d_bank

f_sepa_payments --> d_org
f_sepa_payments --> dim_date
f_sepa_payments --> d_sepa
f_sepa_payments --> d_user

f_cash_snap --> d_org
f_cash_snap --> dim_date

' Governance, Audit & AI feedback
f_audit_fact --> d_org
f_audit_fact --> dim_date
f_audit_fact --> d_user
f_audit_fact --> d_audit

f_ai_feedback --> d_org
f_ai_feedback --> dim_date
f_ai_feedback --> d_user
f_ai_feedback --> d_follow

' Interactions & Disputes
f_interact_fact --> d_org
f_interact_fact --> dim_date
f_interact_fact --> d_partner
f_interact_fact --> d_interact

f_disputes_fact --> d_org
f_disputes_fact --> dim_date
f_disputes_fact --> d_partner
f_disputes_fact --> d_dispute

@enduml