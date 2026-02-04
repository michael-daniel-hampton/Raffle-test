import { Controller, Get, Query, UseGuards, ForbiddenException } from "@nestjs/common";
import { AuthGuard, AuthUser } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Controller("v1/audit")
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listAudit(@CurrentUser() user: AuthUser, @Query("listing_id") listingId?: string) {
    if (process.env.NODE_ENV !== "development") {
      throw new ForbiddenException("Audit endpoint is dev-only in MVP");
    }

    return this.prisma.auditEvent.findMany({
      where: listingId ? { targetId: listingId } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }
}
