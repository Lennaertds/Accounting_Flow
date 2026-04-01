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

' --- EXTERNE/CONFORMED DIMENSIES (STUBS) ---
entity "DimOrganization" as d_org #E1F5FE
entity "DimPartner" as d_partner #E1F5FE
entity "DimProduct" as d_prod #E1F5FE
entity "DimUser" as d_user #E1F5FE
entity "DimLedgerAccount" as d_ledger #E1F5FE

' --- RELATIES ---

' FactPurchaseOperations Relaties
f_purchase --> d_org
f_purchase --> dim_date
f_purchase --> d_partner
f_purchase --> d_prod
f_purchase --> d_out_ord
f_purchase --> d_inc_inv
f_purchase --> d_ledger

' FactLogisticsPerformance Relaties
f_logistics --> d_org
f_logistics --> dim_date
f_logistics --> d_prod
f_logistics --> d_out_ord
f_logistics --> d_receipt
f_logistics --> d_user

' FactInventoryMutations Relaties
f_inv_mut_fact --> d_org
f_inv_mut_fact --> dim_date
f_inv_mut_fact --> d_prod

@enduml