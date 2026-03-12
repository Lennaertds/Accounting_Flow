# Pepol_Flow
An AI-driven, Peppol-native accounting hub for Belgian SMEs. Bridging the gap between orders and invoices with automated reconciliation.

## OLTP ERD Schema (Relational model)
### 🔍 PlantUML (Sterschema Visualisatie)
![Sterschema Fact Constellation](https://kroki.io/plantuml/svg/eNq1WG1v2zYQ_u5fQbTAmhT2GjsNuvXDUNlWUi2OLdhO0KIoBEaibSYUKVBU0qzJf9-RkmxKkd252xLUkXkn8l6ee-7YD6nCUmUxa71CnU4HjZzPk8s5mvhz78IZeTNn7rla0EpvKU-wxDFilBP1kBAkpFoJS5Dg8BYvyUw9MIIkCRXmS0YshXSFI3FP-RItMEttCRcRSUmCuidH1qrE_Nas9o4qx0SR3uO3Vqs4Eb0Y0pjwlAqeooPZCksSoSFW-PAFerk4JieLE_S9heCHcEXVA3rhg9OcyPQFwilsaL4UKvrnNaIReo8uL70h-uKff10LIBAbHY5jAlozJcEca_0Oq4DLJklCkkSwwGxeE5IYU_Z8maZBmKVKxERv2BeCEcxtaZolCaON0msIX4DDUGRcBRS-Vbd_alVCcoXVQGfBhARcqIQjBMn67R0hkVhpvSEJaYzZwUm7d2hJYfdQ0kRBnpqio_C3ICIhgyxrleBafAM1jyuyJLLJZIdj9qBo6OQ-5qbjYvHfpRMdXNObu1-RL8UNIBl9aiMnU6LT7Tj9QafbOz7cFp31Og4VvSO1vDy1nizY-pRhLFFXe3kLOeawzym8l0nC0cGI3BEogRCymxokLwDLRzUkezwUMRzr8TtBwyJ9lIcB5Xd7h8CU9Xvk8ixGB974auIN3DYaTN2hNw_Gk7lre10iL7B2PrV2fg0EEYE4xipcbVeiueFbKiYqAAV_bDuFwiwg30IWaKRuANftVRGnS1FnJz_-9Nw2LpQg4gsaER7qM06ZwMr2T2GVpetw-O546I3P2ujCmQ8-usM2GnozCI3vjAefIUjwxx2N3KF9PNRnXvL_BAU9GwV9kirCgGqXGgnnDEMVcA0CcrzoLaItIJjogG8gYOK_NwhKvtmeslRkMtwAxR8589PJ9KKNfNf3J6M2ci8cbxQ4nh0LSRZE6lBD3lRj-edJTRVkUpFoR1Ylvgd4J5kKEqxWDZVHgRbjGMsHkM3huO1BP36PPhKFzqQQ6lqQW3QwEJKYavtd_9YC_Sd4DvySh_hGcvafNY1K6TnO-Hwy8dvoyp3mD31Y0YiDhdlu6qlxZGGxy0GjYAcQQWT2Nfwm32g7KppLdSvn1-ycA9OlmjKhhxsrlV7Y20rj23YbGYmglwRF1IrWUlcqO8imd27bDsdavgOpQAAwCAngcGYQXSWBSgBGxrRKK8utbWrEa8v3xlkI6VkKUxkF1mYzd95GI8_peyNvDlQ2da_c8SUQv_sJSG9WkH6996YpKTuuftw7UwlwyAqnQAeblFUIOueDO8wya6SoICuB2NJ8VogFV6u0Ni6seVyqoI7Omjv9DEJd-HNtnvd2qIqtiiv7IipgNKaq0euESCqixlIyfPT42OmI73kdlB5CtvXy4_e8qMxyXl5PevmxMN1eF7DL49puI8nTrCXwxmb_IlrFurWTJbC3aiDhtxALqpYYV-cfq-tF3UUv6tbIeJKppaiPPgK6wv8--uSDzU-ONDtmkuJ-UJs8hlPnFCp05o7h03e84bNpowbmU8GYuL9MRmJpYrIw3_cOSenGcztTOCkwg9ccLl5gbpxsC-XUvfDGQ3cadDWxFM-90mz9aT7KtBXwzS1uwsqJjZXqlPR8XiZH170toLFGJX32z41KPx6BgeI4J2wdDjMZbQalcnQ63D53TqYQMT1uTt2BC_0fngp4rpNvh6kPlz59f_kFTYvGkzOkHh2PFu8WuBYPrT-DEwnMnSX_wdLeoWju_vUGWelkcZxxGuJt10HDlETq2_nDj6-vVW9L5Jvm2-xLsxvmzpyW8WiAfjkGNXet_K5TneUu5xN9aRhfOqOmhOlrJbxGU_hH0FzS5dIAU1_3eos6fC_MAf5J4HeNg_mBoUhV2qTXC_y3lp6ECuEZ0ee_AnwwfWQKjwCAGBKI0cGZpDfpYav8LxEoxy8v35mfr7oui4vlTrkppa0aRaHvlOc7lJdYaCAbDWgxwJ-tki6aZOBPeY9Cb9A5hEaTwwSY4Ya8mQoRHa63hpf1-pJMSfQ1Eve880fRIjecYAysaYGdduDL7WqqkMqVqutaz_r4gaRxKnh5eN5WwYOS48CDSfwXtNGDPsPZ_eHac3h3Kh4w68N4VDV9c_Mz9tS01uaUWLCY11ZmZKGeK1e-7bK_pCEAlIAW3jKcYo4YYnl7Jgnhm_iYKm2tBxVbpzQjV2l9gKRmMfsb6hTtCg==)

### PlantUML Broncode
```
@startuml
' --- LAYOUT OPTIMALISATIE ---
skinparam linetype ortho
skinparam packageStyle rectangle
skinparam shadowing false
skinparam nodesep 150
skinparam ranksep 120
skinparam padding 8

package "Dimensions (Shared Data)" #f3e5f5 {
    entity "Partners" as partner {
        * id : UUID [PK]
        --
        * name : String
        * vat_nr : String
        * peppol_id : String
        email : String
        is_customer : Boolean
        is_supplier : Boolean
        bank_account_iban : String
    }

    entity "VatCodes" as vat {
        * code : String [PK]
        --
        * rate : Decimal(5,2)
        * description : String
        * tax_declaration_box : Integer
    }

    entity "AnalyticAccounts" as analytic {
        * id : UUID [PK]
        --
        * name : String (bijv. Project X, Auto-1-ABC-123)
        * code : String
        active : Boolean
    }
}

package "Pilaar 1: Inkomende Facturen (Leveranciers)" #fff3e0 {
    entity "IncomingInvoices" as inc_inv {
        * id : UUID [PK]
        --
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
    }
}

package "Pilaar 2: Inkomende Bestellingen (Klanten)" #e3f2fd {
    entity "IncomingOrders" as inc_order {
        * id : UUID [PK]
        --
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
        * code : Integer [PK]
        --
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

    jrnl ||--o{ entry
    entry ||--|{ trans
    trans }|--|| ledger
    trans }o--o| analytic
    asset }o--|| entry
    budget }o--|| ledger
    budget }o--o| analytic
}

package "Pilaar 4: Uitgaande Facturen (Klanten)" #d1f2d1 {
    entity "OutgoingInvoices" as out_inv {
        * id : UUID [PK]
        --
        * type : Enum (INVOICE, CREDIT_NOTE)
        * order_id : UUID [FK]
        * invoice_nr : String
        * vat_code_id : FK
        * peppol_status : Enum (DRAFT, SENT, PAID, CANCELLED)
    }

    entity "FollowUpLog" as follow {
        * id : UUID [PK]
        --
        * invoice_id : FK
        * sent_at : Timestamp
        * type : Enum (REMINDER_1, REMINDER_2)
    }
    
    out_inv ||--o{ follow
}

package "Pilaar 5: Uitgaande Bestellingen (Leveranciers)" #ffe0b2 {
    entity "OutgoingOrders" as out_order {
        * id : UUID [PK]
        --
        * supplier_id : UUID [FK]
        * channel : Enum (EMAIL, PEPPOL, PLATFORM)
        * status : Enum (ORDERED, RECEIVED, INVOICED)
    }
}

package "Banking & Reconciliation" #e0f7fa {
    entity "BankStatements" as bank {
        * id : UUID [PK]
        --
        * date : Date
        * amount : Decimal
        * communication : String
        * counterparty_iban : String
    }

    entity "ReconciliationLog" as recon {
        * id : UUID
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

' Relaties
' Stamdata (Grijs)
partner ||-[#777777]-o{ inc_inv
partner ||-[#777777]-o{ inc_order
partner ||-[#777777]-o{ out_inv
partner ||-[#777777]-o{ out_order
inc_inv }o-[#777777]-|| vat
out_inv }o-[#777777]-|| vat

' Inkomend / Kosten (Oranje/Rood)
inc_inv -[#OrangeRed]down-> trans
out_order ||-[#OrangeRed]down-o{ match_costs
inc_inv ||-[#OrangeRed]right-o{ match_costs
match_costs -[#Crimson]down-> entry

' Uitgaand / Omzet (Blauw)
out_inv -[#RoyalBlue]down-> trans
inc_order ||-[#RoyalBlue]down-o{ match_revenue
out_inv ||-[#RoyalBlue]left-o{ match_revenue
match_revenue -[#Crimson]down-> entry

' Banking (Groen)
bank ||-[#DarkGreen]right-o{ recon
entry ||-[#DarkGreen]left-o{ recon

@enduml
```
