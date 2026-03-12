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

entity "DimOrganization" as dim_org {
  * OrgKey : int <<PK>>
  --
  OrgID : UUID
  Name : varchar(255)
  VatNr : varchar(50)
  Iban : varchar(34)
}

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

entity "DimVat" as dim_vat {
  * VatKey : int <<PK>>
  --
  VatCode : String
  VatRate : decimal(5,2)
  TaxBox : int
}

entity "DimTransactionType" as dim_type {
  * TypeKey : int <<PK>>
  --
  TransactionType : varchar(50) (INVOICE, CREDIT_NOTE, etc.)
  JournalSource : varchar(50) (AANKOOP, VERKOOP, BANK, DIVERS)
  SourcePillar : varchar(20) (P1, P2, P3, P4, P5)
  PeppolStatus : varchar(50) (Enkel voor P4/P2)
}

entity "DimPartner" as dim_partner {
  * PartnerKey : int <<PK>>
  --
  PartnerID : UUID
  Name : varchar(255)
  VatNr : varchar(50)
  PeppolID : varchar(100)
  Email : varchar(255)
  IBAN : varchar(34)
  IsCustomer : boolean
  IsSupplier : boolean
}

entity "DimLedgerAccount" as dim_ledger {
  * LedgerKey : int <<PK>>
  --
  LedgerCode : int
  LedgerName : varchar(100)
  Category : varchar(50)
}

entity "DimAnalytic" as dim_analytic {
  * AnalyticKey : int <<PK>>
  --
  AnalyticCode : varchar(50)
  ProjectName : varchar(100)
}

entity "DimDocument" as dim_doc {
  * DocumentKey : int <<PK>>
  --
  OriginalFileName : varchar(255)
  StoragePath : varchar(512)
  DocumentType : varchar(50)
  OCR_Confidence : float
  IsPeppol : boolean
}

entity "DimAudit" as dim_audit {
  * AuditKey : int <<PK>>
  --
  UserID : UUID
  UserRole : varchar(50)
  SourceSystem : varchar(50)
  EntryTimestamp : datetime
}

entity "FactFinancialTransactions" as fact_trans {
  * DateKey : int <<FK, PK>>
  * OrgKey : int <<FK, PK>>
  * TimeKey : int <<FK>>
  * TypeKey : int <<FK>>
  * PartnerKey : int <<FK>>
  * LedgerKey : int <<FK>>
  * AnalyticKey : int <<FK>>
  * VatKey : int <<FK>>
  * DocumentKey : int <<FK>>
  * AuditKey : int <<FK>>
  --
  AmountDebet : decimal(12,2)
  AmountCredit : decimal(12,2)
  NetAmount : decimal(12,2)
  VatAmount : decimal(12,2)
  DueDateKey : int <<FK>>
  IsReconciled : boolean
  ' --- Matching Logica ---
  PillarMatchID : UUID 
  IsMatched : boolean
  MatchConfidence : float
}

entity "FactBudgetPerformance" as fact_budget {
  * DateKey : int <<FK, PK>>
  * OrgKey : int <<FK, PK>>
  * LedgerKey : int <<FK, PK>>
  * AnalyticKey : int <<FK, PK>>
  * AuditKey : int <<FK>>
  --
  BudgetAmount : decimal(12,2)
  ActualAmount : decimal(12,2)
  Variance : decimal(12,2)
}

' Relaties
dim_org ||--o{ fact_trans
dim_date ||--o{ fact_trans : "Transaction Date"
dim_time ||--o{ fact_trans : "Transaction Time"
dim_date ||--o{ fact_trans : "Due Date"
dim_type ||--o{ fact_trans
dim_partner ||--o{ fact_trans
dim_ledger ||--o{ fact_trans
dim_analytic ||--o{ fact_trans
dim_vat ||--o{ fact_trans
dim_doc ||--o{ fact_trans
dim_audit ||--o{ fact_trans

dim_org ||--o{ fact_budget
dim_date ||--o{ fact_budget
dim_ledger ||--o{ fact_budget
dim_analytic ||--o{ fact_budget
dim_audit ||--o{ fact_budget
@enduml
```
