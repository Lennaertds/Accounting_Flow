// backend/src/app.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './lib/logger.middleware';

// Infrastructuur & Auth
import { DrizzleModule } from './drizzle/drizzle.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';

// User & Organization
import { UserModule } from './user/user.module';
import { OrganizationModule } from './user/organization.module';

// Partner
import { PartnerModule } from './partner/partner.module';

// Accounting (Gesplitst)
import { AnalyticAccountModule } from './accounting/analytic-account.module';
import { JournalModule } from './accounting/journal.module';
import { JournalEntryModule } from './accounting/journal-entry.module';
import { LedgerAccountModule } from './accounting/ledger-account.module';
import { TransactionModule } from './accounting/transaction.module';

// Banking (Gesplitst)
import { BankStatementModule } from './banking/bank-statement.module';
import { ReconciliationLogModule } from './banking/reconciliation-log.module';

// Invoice (Gesplitst)
import { IncomingInvoiceModule } from './invoice/incoming-invoice.module';
import { OutgoingInvoiceModule } from './invoice/outgoing-invoice.module';
import { VatCodeModule } from './invoice/vat-code.module';

// Order (Gesplitst)
import { IncomingOrderModule } from './order/incoming-order.module';
import { OutgoingOrderModule } from './order/outgoing-order.module';

// Matching (Gesplitst)
import { FollowUpLogModule } from './matching/follow-up-log.module';
import { MatchP2P4Module } from './matching/match-p2-p4.module';
import { MatchP5P1Module } from './matching/match-p5-p1.module';

// Controllers
import { AppController } from './app.controller';
import { HealthController } from './health/health.controller';

// Config
import defaultConfig from './config/default';
import devConfig from './config/development';
import prodConfig from './config/production';

const env = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        defaultConfig,
        env === 'production' ? prodConfig : devConfig
      ],
      isGlobal: true,
    }),
    
    // Infrastructuur
    DrizzleModule,
    AuthModule,
    SessionModule,

    // User
    UserModule,
    OrganizationModule,

    // Relaties
    PartnerModule,

    // Boekhouding
    AnalyticAccountModule,
    JournalModule,
    JournalEntryModule,
    LedgerAccountModule,
    TransactionModule,

    // Bankzaken
    BankStatementModule,
    ReconciliationLogModule,

    // Facturatie
    IncomingInvoiceModule,
    OutgoingInvoiceModule,
    VatCodeModule,

    // Bestellingen
    IncomingOrderModule,
    OutgoingOrderModule,

    // Logica & Matching
    FollowUpLogModule,
    MatchP2P4Module,
    MatchP5P1Module,
  ],
  controllers: [AppController, HealthController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}