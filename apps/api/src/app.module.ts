import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { AuditController } from "./audit/audit.controller";
import { AuditService } from "./audit/audit.service";
import { LegalService } from "./legal/legal.service";
import { PaymentsAdapter } from "./integrations/payments/payments.adapter";
import { ListingsController } from "./listings/listings.controller";
import { ListingsService } from "./listings/listings.service";
import { PrismaService } from "./prisma/prisma.service";

@Module({
  imports: [AuthModule],
  controllers: [ListingsController, AuditController],
  providers: [
    PrismaService,
    ListingsService,
    AuditService,
    PaymentsAdapter,
    LegalService,
  ],
})
export class AppModule {}
