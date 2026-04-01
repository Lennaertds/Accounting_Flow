@startuml
hide circle
skinparam linetype polyline
skinparam nodesep 60
skinparam ranksep 120

title Star Schema: Pilaar 1 - Foundation & Data Health

entity "DimDate" as dim_date {
  * DateKey : int <<PK>>
  --
  FullDate : date
  Day : int
  Month : int
  Year : int
  Quarter : int
}

entity "DimTime" as dim_time {
  * TimeKey : int <<PK>>
  --
  FullTime : time
  Hour : int
  Minute : int
}

package "0 Foundation en Auth Dimensies" #E1F5FE {
    entity "DimOrganization" as d_org {
        * OrgKey : int [PK]
        --
        OrgID : uuid
        Name : varchar(255)
    }

    entity "DimUser" as d_user {
        * UserKey : int [PK]
        --
        UserID : uuid
        FirstName : varchar(255)
        LastName : varchar(255)
        Email : varchar(255)
    }

    entity "DimPartner" as d_partner {
        * PartnerKey : int [PK]
        --
        PartnerID : uuid
        Name : varchar(255)
        VatNr : varchar(50)
        IsCustomer : boolean
        IsSupplier : boolean
    }

    entity "DimProduct" as d_prod {
        * ProductKey : int [PK]
        --
        ProductID : uuid
        SKU : varchar(100)
        Name : varchar(255)
    }
}

package "Master Data Facts" #white {
    entity "FactUserActivity" as f_auth {
        * ActivityKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * UserKey : int [FK]
        * DateKey : int [FK]
        * TimeKey : int [FK]
        --
        LoginCount : int
        SessionDurationSeconds : int
    }

    entity "FactPartnerStats" as f_partner_stats {
        * FactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * PartnerKey : int [FK]
        * DateKey : int [FK]
        --
        IsPeppolReady : boolean
        HasValidVat : boolean
    }

    entity "FactDimensionHealth" as f_dim_health {
        * FactKey : bigint [PK]
        --
        * OrgKey : int [FK]
        * DateKey : int [FK]
        --
        TotalPartners : int
        TotalProducts : int
        PeppolAdoptionRate : decimal(5,2)
    }
}

' --- RELATIES (Star Schema Connections) ---

' User Activity Relaties
f_auth --> d_org : OrgKey
f_auth --> d_user : UserKey
f_auth --> dim_date : DateKey
f_auth --> dim_time : TimeKey

' Partner Stats Relaties
f_partner_stats --> d_org : OrgKey
f_partner_stats --> d_partner : PartnerKey
f_partner_stats --> dim_date : DateKey

' Health Stats Relaties
f_dim_health --> d_org : OrgKey
f_dim_health --> dim_date : DateKey

@enduml