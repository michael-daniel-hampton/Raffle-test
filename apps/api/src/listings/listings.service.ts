import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ListingStatus, PurchaseStatus } from "@prisma/client";
import crypto from "crypto";
import { AuditService } from "../audit/audit.service";
import { PaymentsAdapter } from "../integrations/payments/payments.adapter";
import { LegalService } from "../legal/legal.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateListingDto } from "./dto/create-listing.dto";
import { PurchaseTicketsDto } from "./dto/purchase-tickets.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly payments: PaymentsAdapter,
    private readonly legal: LegalService,
  ) {}

  async createListing(aliasId: string, dto: CreateListingDto) {
    const listing = await this.prisma.listing.create({
      data: {
        sellerAliasId: aliasId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        ticketPrice: dto.ticket_price,
        currency: dto.currency ?? "EUR",
        thresholdCount: dto.threshold_count,
        endDate: dto.end_date ? new Date(dto.end_date) : null,
      },
    });

    await this.audit.record({
      actorAliasId: aliasId,
      action: "LISTING_CREATED",
      targetType: "listing",
      targetId: listing.id,
      metadata: { status: listing.status },
    });

    return listing;
  }

  async updateListing(aliasId: string, id: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      throw new NotFoundException("Listing not found");
    }
    if (listing.sellerAliasId !== aliasId) {
      throw new ForbiddenException("Not the seller");
    }
    if (listing.status !== ListingStatus.DRAFT) {
      throw new BadRequestException("Only drafts can be updated");
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        title: dto.title ?? listing.title,
        description: dto.description ?? listing.description,
        category: dto.category ?? listing.category,
        ticketPrice: dto.ticket_price ?? listing.ticketPrice,
        currency: dto.currency ?? listing.currency,
        thresholdCount: dto.threshold_count ?? listing.thresholdCount,
        endDate: dto.end_date ? new Date(dto.end_date) : listing.endDate,
      },
    });

    await this.audit.record({
      actorAliasId: aliasId,
      action: "LISTING_UPDATED",
      targetType: "listing",
      targetId: updated.id,
      metadata: { status: updated.status },
    });

    return updated;
  }

  async activateListing(aliasId: string, kycVerified: boolean, id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      throw new NotFoundException("Listing not found");
    }
    if (listing.sellerAliasId !== aliasId) {
      throw new ForbiddenException("Not the seller");
    }
    if (!kycVerified) {
      throw new ForbiddenException("KYC verification required");
    }
    if (listing.status !== ListingStatus.DRAFT) {
      throw new BadRequestException("Only drafts can be activated");
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.ACTIVE },
    });

    await this.audit.record({
      actorAliasId: aliasId,
      action: "LISTING_ACTIVATED",
      targetType: "listing",
      targetId: updated.id,
      metadata: { status: updated.status },
    });

    return updated;
  }

  async listListings(status?: ListingStatus) {
    const listings = await this.prisma.listing.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return listings.map((listing) => ({
      ...listing,
      odds: listing.thresholdCount > 0 ? 1 / listing.thresholdCount : 0,
    }));
  }

  async getListing(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { outcome: true },
    });
    if (!listing) {
      throw new NotFoundException("Listing not found");
    }
    return listing;
  }

  async listSellerListings(aliasId: string) {
    return this.prisma.listing.findMany({
      where: { sellerAliasId: aliasId },
      orderBy: { createdAt: "desc" },
    });
  }

  async purchaseTickets(aliasId: string, listingId: string, dto: PurchaseTicketsDto, idempotencyKey?: string) {
    if (!this.legal.canParticipate()) {
      throw new ForbiddenException("Participation not allowed");
    }
    const finalIdempotencyKey = dto.idempotency_key ?? idempotencyKey ?? null;

    return this.prisma.$transaction(async (tx) => {
      const listings = await tx.$queryRawUnsafe<any[]>(
        `SELECT * FROM listings WHERE id = $1 FOR UPDATE`,
        listingId,
      );
      const listing = listings?.[0];
      if (!listing) {
        throw new NotFoundException("Listing not found");
      }
      if (listing.status !== ListingStatus.ACTIVE) {
        throw new BadRequestException("Listing is not active");
      }
      if (listing.end_date && new Date(listing.end_date) < new Date()) {
        await tx.listing.update({
          where: { id: listingId },
          data: { status: ListingStatus.CLOSED },
        });
        throw new BadRequestException("Listing has ended");
      }

      if (finalIdempotencyKey) {
        const existing = await tx.ticketPurchase.findUnique({
          where: { idempotencyKey: finalIdempotencyKey },
          include: { ranges: true, listing: true },
        });
        if (existing) {
          return {
            listing: existing.listing,
            purchase: existing,
            ranges: existing.ranges,
            idempotent: true,
          };
        }
      }

      const ticketPrice = listing.ticket_price as number;
      const amount = ticketPrice * dto.qty;
      const payment = await this.payments.createTicketPayment(listingId, aliasId, dto.qty, amount);
      const paymentStatus = await this.payments.confirmPayment(payment.paymentRef);
      if (paymentStatus !== "CONFIRMED") {
        throw new BadRequestException("Payment failed");
      }

      const startTicket = (listing.tickets_sold as number) + 1;
      const endTicket = startTicket + dto.qty - 1;

      const purchase = await tx.ticketPurchase.create({
        data: {
          listingId,
          buyerAliasId: aliasId,
          qty: dto.qty,
          paymentRef: payment.paymentRef,
          idempotencyKey: finalIdempotencyKey,
          status: PurchaseStatus.CONFIRMED,
        },
      });

      const range = await tx.ticketRange.create({
        data: {
          listingId,
          purchaseId: purchase.id,
          startTicket,
          endTicket,
        },
      });

      const updatedListing = await tx.listing.update({
        where: { id: listingId },
        data: {
          ticketsSold: (listing.tickets_sold as number) + dto.qty,
        },
      });

      await this.audit.record({
        actorAliasId: aliasId,
        action: "TICKETS_PURCHASED",
        targetType: "listing",
        targetId: listingId,
        metadata: { qty: dto.qty, purchaseId: purchase.id },
      });

      let finalListing = updatedListing;
      if (updatedListing.ticketsSold >= updatedListing.thresholdCount) {
        finalListing = await tx.listing.update({
          where: { id: listingId },
          data: { status: ListingStatus.CLOSED },
        });

        await this.audit.record({
          actorAliasId: null,
          action: "LISTING_THRESHOLD_REACHED",
          targetType: "listing",
          targetId: listingId,
          metadata: { ticketsSold: finalListing.ticketsSold },
        });

        const winningTicket = crypto.randomInt(1, finalListing.ticketsSold + 1);
        const winningRange = await tx.ticketRange.findFirst({
          where: {
            listingId,
            startTicket: { lte: winningTicket },
            endTicket: { gte: winningTicket },
          },
          include: { purchase: true },
        });
        if (!winningRange) {
          throw new BadRequestException("Unable to determine winner");
        }
        const seedHash = crypto
          .createHash("sha256")
          .update(`${listingId}-${Date.now()}-${crypto.randomBytes(16).toString("hex")}`)
          .digest("hex");

        await tx.raffleOutcome.create({
          data: {
            listingId,
            winnerAliasId: winningRange.purchase.buyerAliasId,
            rngMethod: "crypto.randomInt",
            rngSeedHash: seedHash,
          },
        });

        await this.audit.record({
          actorAliasId: null,
          action: "WINNER_SELECTED",
          targetType: "listing",
          targetId: listingId,
          metadata: { winningTicket, winnerAliasId: winningRange.purchase.buyerAliasId },
        });

        await this.audit.record({
          actorAliasId: null,
          action: "LISTING_CLOSED",
          targetType: "listing",
          targetId: listingId,
          metadata: { status: finalListing.status },
        });
      }

      return {
        listing: finalListing,
        purchase,
        ranges: [range],
        idempotent: false,
      };
    });
  }
}
