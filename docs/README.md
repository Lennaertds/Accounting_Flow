# OLAP Sterschema (Dimensional Model)
### 🔍 PlantUML (Sterschema Visualisatie)
![Sterschema Fact Constellation](https://kroki.io/plantuml/svg/eNqNVstu2zoQ3fsriGyaFDYQu3EXRVHUsWxcNbGta6sBujIYibZ5I5EGRRUV2v57hw9JtB7pXTjRzCGpMzNnhvqcSSxkniaDE40JiqiIEjLIXig7Y4FTlFBGZHEmiAt54g7AeEwyckbvbx2nwOxFOceT28GAMEllga48mnpYkiuEMxTTdB-DgX4OEHqLlP-BFOgDokyijx-Dh0-fABiN4M8yTxKFA6h2gMfDdiU8rziTp8r6RrCojH9ziIjU9pJmEU4ulhhXQATlMTi_YxGdsLge394A6GcGmCc8Iwp-5jwhmA1-X8QU0rSOSYJhY1L-12JSOIBqB3j-4XlNa0VZrgM25o5EnMWVOUuD1CE7uWkQesKy4vMdS0sHvH1sAJpDFQHbSUHZ0bi2NuckoilOrqfDiUpKiH_c8x-WSyMRUPUMR5JyFoJS6pwo2dicwGMfi8Z2J8Lp7Q269tdPG3--GKL5duH54X69CcEIZt9Wi3U4RPez9cN-F65CRfILJJPhZAf_otZBM1i52QRD9LTYmge1d4g8Hxw7td3sC2iSaKlUiVa7gzG8dAK_d_C7g9-0mf4AVMeIqMI_G9tmwKJ9SbCw7wH69avvgWuNUzeGyXR6Ywq0Fpeh6e1FClRCItLsQs8anQsSU_lIUyqdwo4nprI-pMHZ8-6uGdgjiY9EzKKI56xWWKK9NjqzpC84g1qpGS0bVyPEki4I8MhF0YjyktQM6lxIGlV8sHVYRiXex6nELatGOgX_j0Syi94lC49HuUp8Pdt4SaCE-ghsBD1SILGkCeku9U5ygY8kwHrQVQzHumrl8e2WUWfPt_s5ZweY6Ew3wiHhuNm2sxxEUadPWWXu1HMfbxAT1Ce-L9qFW_GYHmg3ZnprV2SSpC2-CyZFoeYiXEbp2Q58PSAdykuYEUvIGIsoTpyhkekYDmDspfL2XC1LaHUbR3tGX4KNYbUsgY4errB2B1RQlxQrsDGeK3-XfOoTmwVauspOVZ965Jl0dbtBzUTogNdEmhUdGFDtxbyctBOuOfnZVl1jEcjcvUsRegN0R2iFZXSCuwc98iONsPKpBtQzWGPVSETXj5S9IIZhOGtkH0z3wRjxQ2lO9sGducC1o_E-7Xu9K5TE7nMopIQvgAMXKYiN1PJ61tD_0VeXGhy4WxHugtcKbBj2lmIWyRwnr1RRUGziv4QgD2_QliRYUpINqg-1X79GI_7T7a8P6MppP52Iq0H1EfTX9fq76S_ng5zcc9WMa60buJdsN2rvqG6wujC6YfUF1Y2oGd9zpB6ibaw7WiOnPqIO2snUxVuvteBnwmL4tP8DICKxLA==)

### PlantUML Broncode
```
@startuml
hide circle
skinparam linetype ortho
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
  AmPm : varchar(2)
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
  TransactionType : varchar(50) (INVOICE, CREDIT_NOTE, PAYMENT, BANK_STMT)
  JournalSource : varchar(50) (AANKOOP, VERKOOP, BANK, DIVERS)
  SourcePillar : varchar(20) (P1, P2, P3, P4, P5)
}

entity "DimPartner" as dim_partner {
  * PartnerKey : int <<PK>>
  --
  PartnerID : UUID
  Name : varchar(255)
  VatNr : varchar(50)
  PaymentTerms : varchar(100)
  CreditLimit : decimal(12,2)
  IBAN : varchar(34)
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
}

entity "DimAudit" as dim_audit {
  * AuditKey : int <<PK>>
  --
  CreatedBy : varchar(100)
  ModifiedBy : varchar(100)
  SourceSystem : varchar(50)
  EntryTimestamp : datetime
}

entity "FactFinancialTransactions" as fact_trans {
  * DateKey : int <<FK, PK>>
  * TimeKey : int <<FK, PK>>
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
  PillarMatchID : UUID (Link naar Match_P5_P1 of Match_P2_P4)
  IsMatched : boolean
  MatchConfidence : float
}

entity "FactBudgetPerformance" as fact_budget {
  * DateKey : int <<FK, PK>>
  * LedgerKey : int <<FK, PK>>
  * AnalyticKey : int <<FK, PK>>
  * AuditKey : int <<FK>>
  --
  BudgetAmount : decimal(12,2)
  ActualAmount : decimal(12,2)
  Variance : decimal(12,2)
}

' Relaties
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

dim_date ||--o{ fact_budget
dim_ledger ||--o{ fact_budget
dim_analytic ||--o{ fact_budget
dim_audit ||--o{ fact_budget
@enduml
```
