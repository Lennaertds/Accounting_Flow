# Accounting_Flow
An AI-driven, Peppol-native accounting hub for Belgian SMEs. Bridging the gap between orders and invoices with automated reconciliation.

## Dependencies
```
npm install @nestjs/typeorm typeorm pg @nestjs/config class-validator class-transformer
npm install --save-dev @types/node
npm install @nestjs/jwt passport-jwt
npm install --save-dev @types/passport-jwt
npm install --save-dev @nestjs/testing jest ts-jest @types/jest supertest @types/supertest
npm install @nestjs/swagger swagger-ui-express
npm install nestjs-swagger-dto
npm install class-validator class-transformer reflect-metadata
npm install pg typeorm @nestjs/typeorm
npm install argon2
npm install --save-dev jest ts-jest supertest @types/jest @types/supertest
```

## OLTP ERD Schema (Relational model)
### 🔍 PlantUML (Sterschema Visualisatie)
![Sterschema Fact Constellation](https://kroki.io/plantuml/svg/eNrFWG1v2zYQ_q5fQbRAlwwOkLgN2vVTFVvptPgNfslWFIXASLTNRiIFikrqNfnvO5KSTSmSWw9dl6KJfXcieXfP3T3Uu0xiIfMkdn5BJycnaOB-GC_maDyZ-0N34M_cue8phZPdUpZigRMUU0bkJiWIC7nmliLF4S1ekZncxAQJEkrMVjGxDLI1jvg9ZSu0xHFmaxiPSEZSdHZ6akkFZrdK-ua0sksUqSXeOE6xIXq2yIhAL5CbyzUaYgayhDD5DD2_X1NJ0FcHwQ9IqNwY4-wZwhnK1WNGqX5-RTRCb9Fi4ffRx8nVp60C3N_ZkATTGMxmUsAxLEWKs-yeiyhY42zdZCA4xOUt8lieoCO3P_RHHeT2euPFaO6O5h107Xt_etPj7RMxzmQQ8xVl8NScJgRylaRa_ehUXBqLFWb0bywpZ8Y1LlYHe8ZwQprOnWyCOywDJlqU9Aazp6pQECxJFGDZcHr1W0f_kZ-c8Ad1XOfRSmgf7FmmvEFHszUWJEJ9LPExpHT5kpwvz2s5nQCIWZnW1Hw52H84RGDZXVp27cFpj0xK0pTHZsWasgVDNAvCPJM8IWrBCw54wczWZnmaxrRRCzm4DXAY8pzJhozUAHONZU-VnI4XuFCJVQia7dN74iUgv2DXJyFNcHx03ukeW1pYPRQ0VZBsio7EX4KIhDHUtDIJbvgXMPOZJCsimo7sMhxvJA1d46M5Oi6EPyfXlcBs5TiU9I7UUvJYgfOExhgLdKYcvIX0MljnEp7LBWHoaEDuCLS6EBKbaYQvAeOnNYT7LOQJbOuzO07DInOUhQFldz_We93byzblj67Hfs_roN7U6_vzYDSee3aWS0S2LwcdEdQJluG63Ygar1oqKSqABn_sc3KJ44B8CWPVniwgnnWrSFQlqlJntr-8sg8XClCxJY0IC9UelzHH0vZPYpln23BMvFHfH73voKE77_3u9Tuo788gNBN31PsAQYI_3mDg9e3toW5NK_geiHRtiFxAzyQxzNuVgslVjKE6mEIIebnsLqMWhIxVwHf40PH_sQgpm1S7RcZzEe5QNBm488vxdNhBE28yGQ86yBu6_iBwfTtQgiyJUHmApMrGnmEynklIM4yWPSkX-B4KI81lkGLZMIwxhV6aJFhs1HCC7doz8vIt-p1I9F5wLm84uUVHPS6IrtPf1L9aFv4Az6Epmfh_Fiz-Oa2pUrSuO7oajyfAKLyp-XABEoVVEMyO93a0Wtct3PEYWBRNB1QQtkO9-mwWavesuchbp0jtnHNooJnqxCUBkkpwOLlTvrWfMSYRTKegiFoxrOpG5UzaTeO25XCi9HtgDK0DeDSH0RBruFfbRyUAA320ynA0p20a7duTH8wFQ0jPiuuyKbA2m3nAXQe-e-EP_Dk0wal37Y0WMDK8v6BdzopxUZ_mWUbKGa4-HpypFBoMEG3oFbuUVVq7aRZ3OM4tklJBVgqxpYZ9JJzJdVYjINsJIGRQR2fNnYscQl34c6M_H-xQFVsVVw5FVBDThMpGr1MiKI_qpdTQ9l7BBlSuMK5yFWsIRWfLbnRWa3_jXK54naZw6MP_L00xJORf0o89_KHg-DWW0J-6l1ATM0_d6iau33_CDGrwueRxzO8X6YCvdMCW-vvB8SrdeHrODHZquok1hHLqwcW0702DM1XKxefucTtSzm2kVCnLU2ZLTm-6LZCxeIsCzH_AW75NVqGlMEbibTA0TdmxlpLHHLczxPEU4qWI4dTreTBv4VMBzn5TDC_g2qZuWS_QtGj0piMpkne6fL3EtWAp-xnsqF9wFP0GRD82Ts2juD6tKmMlSXJGQ9x229Ntiwh1M998-3ZaDUVZFHoSHuyovhdnZcQaSqMkJs1zxNxbquxqMR-rC8Bo4Q6aUurmQI7h5Bn8J2gu6Gqlca3udd1lHf1DvcHkPJicaS_NhiHPZNZk1w0mryw7AQXGcqL2N-_vpt5AvbKb6Xd26iXQw8PJCf9avhOxReVUsWXFhdIWFc27LtLlWX_0iVARYPu7yobjaFpcSHTYHcMplejhq6FujiFwj0r0UAzHUmbeGW3PbwiEkoKlWa-YwYWseNoS2o875XgqTmSar6PLqhBp6FmH3Iog6lCNCRQMBkmsMp455fsnsPz4_LX--WQHd5_eRLDNoszFPr1ZoXwzAM7uLCAUMMu2_jbpwCGNNNWTZAFdZ9eO9YZjyMKKTEmk97QBW-76HWbWelO-wfEF8DTLsAS2lZv9hs47uDLnSfwPzlZygA==)

### PlantUML Broncode
```
@startuml
' --- LAYOUT OPTIMALISATIE ---
skinparam linetype ortho
skinparam packageStyle rectangle
skinparam shadowing false
skinparam nodesep 100
skinparam ranksep 80
skinparam padding 8

package "User & Auth Management" #white {
    entity "Users" as user {
        * id : UUID [PK]
        --
        * email : String
        * password_hash : String
        * role : Enum (ADMIN, ACCOUNTANT, VIEWER)
        last_login : Timestamp
    }

    entity "Organizations" as org {
        * id : UUID [PK]
        --
        * name : String
        * my_vat_nr : String
        * my_iban : String
        created_at : Timestamp
    }
    user }o--o| org
}

package "Dimensions (Shared Data)" #f3e5f5 {
    entity "Partners" as partner {
        * id : UUID [PK]
        --
        * org_id : UUID [FK]
        * name : String
        * vat_nr : String
        * peppol_id : String
        preferred_order_channel: String
        preferred_invoice_channel: String
        email : String
        is_peppol_ready : Boolean
        is_customer : Boolean
        is_supplier : Boolean
        bank_account_iban : String
    }

    entity "VatCodes" as vat {
        * code : String [PK]
        --
        * org_id : UUID [FK]
        * rate : Decimal(5,2)
        * description : String
        * tax_declaration_box : Integer
    }

    entity "AnalyticAccounts" as analytic {
        * id : UUID [PK]
        --
        * org_id : UUID [FK]
        * name : String
        * code : String
        active : Boolean
    }
}

package "Pilaar 1: Inkomende Facturen (Leveranciers)" #fff3e0 {
    entity "IncomingInvoices" as inc_inv {
        * id : UUID [PK]
        --
        * org_id : UUID [FK]
        * type : Enum (INVOICE, CREDIT_NOTE)
        * supplier_id : UUID [FK]
        * order_match_id : UUID [FK]
        * invoice_nr : String
        * date : Date
        * total_excl_vat : Decimal(12,2)
        * vat_code_id : FK
        * ocr_confidence : Float
        * status : Enum (PENDING, MATCHED, DISCREPANCY, CANCELLED)
        * is_peppol : Boolean
        * raw_file_storage_path : String
    }
}

package "Pilaar 2: Inkomende Bestellingen (Klanten)" #e3f2fd {
    entity "IncomingOrders" as inc_order {
        * id : UUID [PK]
        --
        * org_id : UUID [FK]
        * customer_id : UUID [FK]
        * source : Enum (PLATFORM, PEPPOL, EMAIL_AI)
        * reference_ext : String
        * total_estimated : Decimal(12,2)
        * raw_input_path : String
        ai_summary : Text
    }
}

package "Pilaar 3: Het Grootboek (Core)" #f9f9f9 {
    entity "Journals" as jrnl {
        * id : UUID [PK]
        --
        * org_id : UUID [FK]
        * name : String
        * type : Enum (AANKOOP, VERKOOP, BANK, DIVERS)
        * code : String
    }

    entity "JournalEntries" as entry {
        * id : UUID [PK]
        --
        * journal_id : UUID [FK]
        * date : Date
        * description : String
    }

    entity "Transactions" as trans {
        * id : UUID [PK]
        --
        * entry_id : UUID [FK]
        * ledger_code : Integer [FK]
        * analytic_account_id : UUID [FK]
        * amount : Decimal(12,2)
        * is_reconciled : Boolean
    }

    entity "LedgerAccounts" as ledger {
        * id : UUID [PK]
        * code : Integer [PK]
        --
        * org_id : UUID [FK]
        * name : String
        * category : Enum (ASSET, LIABILITY, REVENUE, EXPENSE)
    }

    entity "Assets" as asset {
        * id : UUID [PK]
        --
        * purchase_entry_id : FK
        * total_value : Decimal
        * depreciation_months : Integer
        * start_date : Date
    }

    entity "Budgets" as budget {
        * id : UUID [PK]
        --
        * ledger_code : FK
        * analytic_account_id : UUID [FK]
        * amount_limit : Decimal
        * period : String
    }
}

package "Pilaar 4: Uitgaande Facturen (Klanten)" #d1f2d1 {
    entity "OutgoingInvoices" as out_inv {
        * id : UUID [PK]
        --
        * org_id : UUID [FK]
        * type : Enum (INVOICE, CREDIT_NOTE)
        * order_id : UUID [FK]
        * invoice_nr : String
        * vat_code_id : FK
        * peppol_status : Enum (DRAFT, SENT, PAID, CANCELLED)
        * raw_file_storage_path : String
    }

    entity "FollowUpLog" as follow {
        * id : UUID [PK]
        --
        * invoice_id : FK
        * sent_at : Timestamp
        * type : Enum (REMINDER_1, REMINDER_2)
    }
}

package "Pilaar 5: Uitgaande Bestellingen (Leveranciers)" #ffe0b2 {
    entity "OutgoingOrders" as out_order {
        * id : UUID [PK]
        --
        * org_id : UUID [FK]
        * supplier_id : UUID [FK]
        * channel : Enum (EMAIL, PEPPOL, PLATFORM)
        * status : Enum (ORDERED, RECEIVED, INVOICED)
    }
}

package "Banking & Reconciliation" #e0f7fa {
    entity "BankStatements" as bank {
        * id : UUID [PK]
        --
        * org_id : UUID [FK]
        * date : Date
        * amount : Decimal
        * communication : String
        * counterparty_iban : String
    }

    entity "ReconciliationLog" as recon {
        * id : UUID [PK]
        --
        * bank_statement_id : FK
        * journal_entry_id : FK
        match_type : Enum (AUTO, MANUAL)
    }
}

package "Automatisatie Triggers" #fff2f2 {
    entity "Match_P5_P1" as match_costs
    entity "Match_P2_P4" as match_revenue
}

' --- RELATIES ---
org ||--o{ partner
org ||--o{ analytic
org ||--o{ inc_inv
org ||--o{ out_inv
org ||--o{ out_order
org ||--o{ inc_order
org ||--o{ jrnl
org ||--o{ bank

jrnl ||--o{ entry
entry ||--|{ trans
trans }|--|| ledger
trans }o--o| analytic
asset }o--|| entry
budget }o--|| ledger
budget }o--o| analytic

out_inv ||--o{ follow
bank ||--o{ recon
entry ||--o{ recon

' Stamdata relaties
partner ||-[#777777]-o{ inc_inv
partner ||-[#777777]-o{ inc_order
partner ||-[#777777]-o{ out_inv
partner ||-[#777777]-o{ out_order
inc_inv }o-[#777777]-|| vat
out_inv }o-[#777777]-|| vat

' Matching triggers
out_order ||-[#OrangeRed]-o{ match_costs
inc_inv ||-[#OrangeRed]-o{ match_costs
inc_order ||-[#RoyalBlue]-o{ match_revenue
out_inv ||-[#RoyalBlue]-o{ match_revenue

@enduml
```
