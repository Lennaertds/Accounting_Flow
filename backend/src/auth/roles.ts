// backend/src/auth/roles.ts

export enum Role {
    ADMIN = 'ADMIN',           // Volledige toegang tot de organisatie
    ACCOUNTANT = 'ACCOUNTANT', // Mag boeken, afletteren en BTW-aangiftes doen
    VIEWER = 'VIEWER',         // Alleen-lezen toegang voor dashboards/rapporten
}