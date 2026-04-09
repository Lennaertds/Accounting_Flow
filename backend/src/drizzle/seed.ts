// backend/src/drizzle/seed.ts
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { sql, eq, and } from 'drizzle-orm';
import * as schema from './schema';
import * as data from './seed-data';
import { AuthService } from '../auth/auth.service';
import { DatabaseProvider, DrizzleAsyncProvider } from './drizzle.provider';

async function bootstrap() {
    const logger = new Logger('SeedScript');
    logger.log('--- 🚀 Starting Full Seeding Process ---');

    let app;
    try {
        app = await NestFactory.createApplicationContext(AppModule);
    } catch (err) {
        logger.error('❌ Failed to create NestJS context.');
        throw err;
    }

    try {
        const authService = app.get(AuthService);
        const db: DatabaseProvider = app.get(DrizzleAsyncProvider);

        // 1. OPRUIMEN (Cascade zorgt voor de rest)
        logger.log('🧹 1/10: Cleaning existing data...');
        await db.execute(sql`TRUNCATE TABLE pepol_app.organizations CASCADE`);

        // 2. ORGANIZATIONS & USERS
        logger.log('🌱 2/10: Seeding Organizations & Users...');
        const orgMap = new Map<string, string>();
        const userMap = new Map<string, string>();
        for (const org of data.SEED_ORGANIZATIONS) {
            const [inserted] = await db.insert(schema.organizations).values({
                name: org.name, vat: org.vat, iban: org.iban
            }).returning();
            orgMap.set(org.seedKey, inserted.id);
        }

        for (const u of data.SEED_USERS) {
            const newUser = await authService.register({ ...u, orgId: orgMap.get(u.orgSeedKey)! });
            userMap.set(u.email, newUser.id);
        }

        // 3. STAMGEGEVENS (Partners, Products, VatCodes, Journals)
        logger.log('📦 3/10: Seeding Master Data...');
        const partnerMap = new Map<string, string>(); // "orgKey:name" -> UUID
        const productMap = new Map<string, string>(); // "orgKey:sku" -> UUID
        const vatMap = new Map<string, string>();     // "orgKey:code" -> UUID
        const journalMap = new Map<string, string>(); // "orgKey:code" -> UUID
        const ledgerMap = new Map<string, string>();  // "orgKey:code" -> UUID

        for (const p of data.SEED_PARTNERS) {
            const [inserted] = await db.insert(schema.partners).values({
                ...p, orgId: orgMap.get(p.orgSeedKey)!
            }).returning();
            partnerMap.set(`${p.orgSeedKey}:${p.name}`, inserted.id);
        }

        for (const prod of data.SEED_PRODUCTS) {
            const [inserted] = await db.insert(schema.products).values({
                ...prod, orgId: orgMap.get(prod.orgSeedKey)!
            }).returning();
            productMap.set(`${prod.orgSeedKey}:${prod.sku}`, inserted.id);
        }

        for (const v of data.SEED_VAT_CODES) {
            const [inserted] = await db.insert(schema.vatCodes).values({
                ...v, orgId: orgMap.get(v.orgSeedKey)!
            }).returning();
            vatMap.set(`${v.orgSeedKey}:${v.code}`, inserted.id);
        }

        for (const j of data.SEED_JOURNALS) {
            const [inserted] = await db.insert(schema.journals).values({
                ...j, orgId: orgMap.get(j.orgSeedKey)!
            }).returning();
            journalMap.set(`${j.orgSeedKey}:${j.code}`, inserted.id);
        }

        for (const l of data.SEED_LEDGER_ACCOUNTS) {
            const [inserted] = await db.insert(schema.ledgerAccounts).values({
                ...l, orgId: orgMap.get(l.orgSeedKey)!
            }).returning();
            ledgerMap.set(`${l.orgSeedKey}:${l.code}`, inserted.id);
        }

        // 4. INKOOP FLOW (Orders -> Receipts -> Invoices)
        logger.log('🛒 4/10: Seeding Purchase Flow...');
        const purchaseOrderMap = new Map<string, string>(); // orderNr -> UUID

        for (const ord of data.SEED_OUTGOING_ORDERS) {
            const orgId = orgMap.get(ord.orgSeedKey)!;
            const [inserted] = await db.insert(schema.outgoingOrders).values({
                orgId,
                supplierId: partnerMap.get(`${ord.orgSeedKey}:${ord.supplierName}`)!,
                orderNr: ord.orderNr,
                date: ord.date,
                totalEstimated: ord.totalEstimated,
                channel: ord.channel,
                status: ord.status
            }).returning();
            purchaseOrderMap.set(ord.orderNr, inserted.id);

            for (const line of ord.lines) {
                await db.insert(schema.outgoingOrderLines).values({
                    orderId: inserted.id,
                    productId: productMap.get(`${ord.orgSeedKey}:${line.productSku}`),
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    vatCodeId: vatMap.get(`${ord.orgSeedKey}:${line.vatCode}`)!
                });
            }
        }

        for (const rec of data.SEED_GOODS_RECEIPTS) {
            const userId = userMap.get(rec.receivedByEmail);
            if (!userId) {
                logger.error(`User with email ${rec.receivedByEmail} not found in userMap`);
                continue;
            }

            const [inserted] = await db.insert(schema.goodsReceipts).values({
                orgId: orgMap.get(rec.orgSeedKey)!,
                outgoingOrderId: purchaseOrderMap.get(rec.orderNr)!,
                receivedBy: userId,                               
                deliveryNoteRef: rec.deliveryNoteRef
            }).returning();

            for (const line of rec.lines) {
                await db.insert(schema.goodsReceiptLines).values({
                    receiptId: inserted.id,
                    productId: productMap.get(`${rec.orgSeedKey}:${line.productSku}`)!,
                    quantityReceived: line.quantityReceived,
                    condition: line.condition
                });
            }
        }

        const incomingInvoiceMap = new Map<string, string>();
        for (const inv of data.SEED_INCOMING_INVOICES) {
            const [inserted] = await db.insert(schema.incomingInvoices).values({
                orgId: orgMap.get(inv.orgSeedKey)!,
                supplierId: partnerMap.get(`${inv.orgSeedKey}:${inv.supplierName}`)!,
                invoiceNr: inv.invoiceNr,
                date: inv.date,
                totalExclVat: inv.totalExclVat,
                vatCodeId: vatMap.get(`${inv.orgSeedKey}:${inv.vatCode}`)!,
                status: inv.status
            }).returning();
            incomingInvoiceMap.set(inv.invoiceNr, inserted.id);

            for (const line of inv.lines) {
                await db.insert(schema.incomingInvoiceLines).values({
                    invoiceId: inserted.id,
                    productId: line.productSku ? productMap.get(`${inv.orgSeedKey}:${line.productSku}`) : null,
                    description: line.description,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    vatCodeId: vatMap.get(`${inv.orgSeedKey}:${line.vatCode}`)!,
                    ledgerAccountId: line.ledgerAccountCode ? ledgerMap.get(`${inv.orgSeedKey}:${line.ledgerAccountCode}`) : null
                });
            }
        }

        // // 5. VERKOOP FLOW (Orders -> Invoices)
        // logger.log('💰 5/10: Seeding Sales Flow...');
        // const outgoingInvoiceMap = new Map<string, string>();

        // for (const ord of data.SEED_INCOMING_ORDERS) {
        //     const [inserted] = await db.insert(schema.incomingOrders).values({
        //         orgId: orgMap.get(ord.orgSeedKey)!,
        //         customerId: partnerMap.get(`${ord.orgSeedKey}:${ord.customerName}`)!,
        //         orderNr: ord.orderNr,
        //         date: ord.date,
        //         source: ord.source,
        //         referenceExt: ord.referenceExt,
        //         totalEstimated: ord.totalEstimated,
        //         status: ord.status,
        //         aiSummary: ord.aiSummary
        //     }).returning();

        //     for (const line of ord.lines) {
        //         await db.insert(schema.incomingOrderLines).values({
        //             orderId: inserted.id,
        //             productId: line.productSku ? productMap.get(`${ord.orgSeedKey}:${line.productSku}`) : null,
        //             description: line.description,
        //             quantity: line.quantity,
        //             unitPrice: line.unitPrice,
        //             vatCodeId: vatMap.get(`${ord.orgSeedKey}:${line.vatCode}`)!
        //         });
        //     }
        // }

        // for (const inv of data.SEED_OUTGOING_INVOICES) {
        //     const [inserted] = await db.insert(schema.outgoingInvoices).values({
        //         orgId: orgMap.get(inv.orgSeedKey)!,
        //         customerId: partnerMap.get(`${inv.orgSeedKey}:${inv.customerName}`)!,
        //         invoiceNr: inv.invoiceNr,
        //         date: inv.date,
        //         totalExclVat: inv.totalExclVat,
        //         vatCodeId: vatMap.get(`${inv.orgSeedKey}:${inv.vatCode}`)!,
        //         peppolStatus: inv.peppolStatus
        //     }).returning();
        //     outgoingInvoiceMap.set(inv.invoiceNr, inserted.id);

        //     for (const line of inv.lines) {
        //         await db.insert(schema.outgoingInvoiceLines).values({
        //             invoiceId: inserted.id,
        //             productId: line.productSku ? productMap.get(`${inv.orgSeedKey}:${line.productSku}`) : null,
        //             description: line.description,
        //             quantity: line.quantity,
        //             unitPrice: line.unitPrice,
        //             vatCodeId: vatMap.get(`${inv.orgSeedKey}:${line.vatCode}`)!,
        //             ledgerAccountId: line.ledgerAccountCode ? ledgerMap.get(`${inv.orgSeedKey}:${line.ledgerAccountCode}`) : null
        //         });
        //     }
        // }

        // // 6. ACCOUNTING (Journal Entries & Transactions)
        // logger.log('📖 6/10: Seeding Journal Entries...');
        // const entryMap = new Map<string, string>(); // description -> UUID

        // for (const entry of data.SEED_JOURNAL_ENTRIES) {
        //     const [inserted] = await db.insert(schema.journalEntries).values({
        //         orgId: orgMap.get(entry.orgSeedKey)!,
        //         journalId: journalMap.get(`${entry.orgSeedKey}:${entry.journalCode}`)!,
        //         date: entry.date,
        //         description: entry.description
        //     }).returning();
        //     entryMap.set(entry.description, inserted.id);
        // }

        // for (const tx of data.SEED_TRANSACTIONS) {
        //     await db.insert(schema.transactions).values({
        //         orgId: orgMap.get(tx.orgSeedKey)!,
        //         entryId: entryMap.get(tx.entryDescription)!,
        //         ledgerAccountId: ledgerMap.get(`${tx.orgSeedKey}:${tx.ledgerCode}`)!,
        //         amount: tx.amount,
        //         isReconciled: tx.isReconciled
        //     });
        // }

        // // 7. ASSETS & BUDGETS
        // logger.log('📈 7/10: Seeding Assets & Budgets...');
        // for (const asset of data.SEED_ASSETS) {
        //     await db.insert(schema.assets).values({
        //         orgId: orgMap.get(asset.orgSeedKey)!,
        //         name: asset.name,
        //         purchaseEntryId: entryMap.get(asset.purchaseEntryDescription)!,
        //         totalValue: asset.totalValue,
        //         depreciationMonths: asset.depreciationMonths,
        //         startDate: asset.startDate
        //     });
        // }

        // for (const b of data.SEED_BUDGETS) {
        //     await db.insert(schema.budgets).values({
        //         orgId: orgMap.get(b.orgSeedKey)!,
        //         ledgerAccountId: ledgerMap.get(`${b.orgSeedKey}:${b.ledgerCode}`)!,
        //         amountLimit: b.amountLimit,
        //         period: b.period
        //     });
        // }

        // // 8. BANKING
        // logger.log('🏦 8/10: Seeding Bank Statements...');
        // const bankStmtMap = new Map<string, string>();
        // for (const stmt of data.SEED_BANK_STATEMENTS) {
        //     const [inserted] = await db.insert(schema.bankStatements).values({
        //         ...stmt, orgId: orgMap.get(stmt.orgSeedKey)!
        //     }).returning();
        //     bankStmtMap.set(stmt.bankReference, inserted.id);
        // }

        // // 9. RECONCILIATION LOGS
        // logger.log('🔗 9/10: Seeding Reconciliation Logs...');
        // for (const rec of data.SEED_RECONCILIATION_LOGS) {
        //     const orgId = orgMap.get(rec.orgSeedKey)!;
        //     // Zoek de transactie op basis van entry en ledgerCode
        //     const entryId = entryMap.get(rec.journalEntryDescription)!;
        //     const ledgerId = ledgerMap.get(`${rec.orgSeedKey}:${rec.ledgerCode}`)!;
            
        //     const [tx] = await db.select().from(schema.transactions)
        //         .where(and(eq(schema.transactions.entryId, entryId), eq(schema.transactions.ledgerAccountId, ledgerId)));

        //     if (tx) {
        //         await db.insert(schema.reconciliationLogs).values({
        //             orgId,
        //             bankStatementId: bankStmtMap.get(rec.bankReference)!,
        //             journalEntryId: entryId,
        //             transactionId: tx.id,
        //             matchType: rec.matchType
        //         });
        //     }
        // }

        // // 10. GOVERNANCE & CONFIG
        // logger.log('🛡️ 10/10: Seeding Logs & Configs...');
        // for (const log of data.SEED_INTERACTION_LOGS) {
        //     await db.insert(schema.interactionLogs).values({
        //         orgId: orgMap.get(log.orgSeedKey)!,
        //         partnerId: partnerMap.get(`${log.orgSeedKey}:${log.partnerName}`)!,
        //         type: log.type,
        //         message: log.message,
        //         entityType: log.entityType,
        //         // Optioneel: entityId opzoeken via referentie
        //     });
        // }

        // for (const conf of data.SEED_DASHBOARD_CONFIGS) {
        //     await db.insert(schema.userDashboardConfigs).values({
        //         userId: userMap.get(conf.userEmail)!,
        //         layout: conf.layout,
        //         theme: conf.theme
        //     });
        // }

        logger.log('--- ✨ Database Seeded Successfully! ---');
    } catch (err) {
        logger.error('❌ Seeding failed!');
        logger.error(err);
    } finally {
        await app.close();
    }
}

bootstrap();