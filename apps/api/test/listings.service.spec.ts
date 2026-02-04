import { ListingsService } from "../src/listings/listings.service";
import { AuditService } from "../src/audit/audit.service";
import { PaymentsAdapter } from "../src/integrations/payments/payments.adapter";
import { LegalService } from "../src/legal/legal.service";
import { ListingStatus } from "@prisma/client";

const createService = () => {
  const prisma = {
    listing: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    ticketPurchase: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    ticketRange: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    raffleOutcome: {
      create: jest.fn(),
    },
    auditEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
    $queryRawUnsafe: jest.fn(),
  } as any;

  const audit = new AuditService(prisma as any);
  const payments = new PaymentsAdapter();
  const legal = new LegalService();

  return { prisma, audit, payments, legal, service: new ListingsService(prisma as any, audit, payments, legal) };
};

describe("ListingsService", () => {
  it("requires kyc for activation", async () => {
    const { service, prisma } = createService();
    prisma.listing.findUnique.mockResolvedValue({
      id: "listing-1",
      sellerAliasId: "seller-1",
      status: ListingStatus.DRAFT,
    });

    await expect(service.activateListing("seller-1", false, "listing-1")).rejects.toThrow(
      "KYC verification required",
    );
  });

  it("allocates ticket ranges correctly", async () => {
    const { service, prisma } = createService();
    const listingRow = {
      id: "listing-1",
      status: ListingStatus.ACTIVE,
      tickets_sold: 5,
      ticket_price: 10,
      threshold_count: 100,
    };

    prisma.$transaction.mockImplementation(async (callback: any) => {
      return callback({
        $queryRawUnsafe: jest.fn().mockResolvedValue([listingRow]),
        ticketPurchase: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: "purchase-1", listingId: "listing-1" }),
        },
        ticketRange: {
          create: jest.fn().mockResolvedValue({ startTicket: 6, endTicket: 8 }),
          findFirst: jest.fn(),
        },
        listing: {
          update: jest.fn().mockResolvedValue({
            id: "listing-1",
            ticketsSold: 8,
            thresholdCount: 100,
            status: ListingStatus.ACTIVE,
          }),
        },
        raffleOutcome: { create: jest.fn() },
      });
    });

    const result = await service.purchaseTickets("buyer-1", "listing-1", { qty: 3 });
    expect(result.ranges[0].startTicket).toBe(6);
    expect(result.ranges[0].endTicket).toBe(8);
  });

  it("honors idempotency", async () => {
    const { service, prisma } = createService();
    const listingRow = {
      id: "listing-1",
      status: ListingStatus.ACTIVE,
      tickets_sold: 0,
      ticket_price: 10,
      threshold_count: 100,
    };

    prisma.$transaction.mockImplementation(async (callback: any) => {
      return callback({
        $queryRawUnsafe: jest.fn().mockResolvedValue([listingRow]),
        ticketPurchase: {
          findUnique: jest.fn().mockResolvedValue({
            id: "purchase-1",
            listing: { id: "listing-1" },
            ranges: [{ id: "range-1" }],
          }),
        },
      });
    });

    const result = await service.purchaseTickets("buyer-1", "listing-1", { qty: 1, idempotency_key: "key" });
    expect(result.idempotent).toBe(true);
  });

  it("closes and selects winner when threshold met", async () => {
    const { service, prisma } = createService();
    const listingRow = {
      id: "listing-1",
      status: ListingStatus.ACTIVE,
      tickets_sold: 9,
      ticket_price: 10,
      threshold_count: 10,
    };

    const outcomeCreate = jest.fn();

    prisma.$transaction.mockImplementation(async (callback: any) => {
      return callback({
        $queryRawUnsafe: jest.fn().mockResolvedValue([listingRow]),
        ticketPurchase: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: "purchase-1", listingId: "listing-1" }),
        },
        ticketRange: {
          create: jest.fn().mockResolvedValue({ startTicket: 10, endTicket: 10 }),
          findFirst: jest.fn().mockResolvedValue({
            purchase: { buyerAliasId: "winner-1" },
          }),
        },
        listing: {
          update: jest
            .fn()
            .mockResolvedValueOnce({
              id: "listing-1",
              ticketsSold: 10,
              thresholdCount: 10,
              status: ListingStatus.ACTIVE,
            })
            .mockResolvedValueOnce({
              id: "listing-1",
              ticketsSold: 10,
              thresholdCount: 10,
              status: ListingStatus.CLOSED,
            }),
        },
        raffleOutcome: { create: outcomeCreate },
      });
    });

    const result = await service.purchaseTickets("buyer-1", "listing-1", { qty: 1 });
    expect(result.listing.status).toBe(ListingStatus.CLOSED);
    expect(outcomeCreate).toHaveBeenCalled();
  });
});
