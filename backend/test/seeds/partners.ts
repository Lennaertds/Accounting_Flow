// test/seeds/partners.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { partners } from '../../src/drizzle/schema';
import { CommunicationChannel } from '../../src/partner/partner.dto';

export async function seedPartners(db: DatabaseProvider, orgId: string) {
    await db.insert(partners).values([
        {
            orgId,
            name: 'ACME Supplies BV',
            vatNr: 'BE0999888777',
            peppolId: '0088:999888777',
            email: 'sales@acme.com',
            isSupplier: true,
            isCustomer: false,
            preferredInvoiceChannel: CommunicationChannel.PEPPOL,
        },
        {
            orgId,
            name: 'Bol.com Groothandel',
            vatNr: 'NL123456789B01',
            email: 'finance@bol.com',
            isSupplier: true,
            isCustomer: true,
            preferredInvoiceChannel: CommunicationChannel.EMAIL,
        }
    ]);
}