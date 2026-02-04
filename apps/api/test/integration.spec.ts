import { PrismaClient } from "@prisma/client";

const shouldRun = Boolean(process.env.DATABASE_URL);

(shouldRun ? describe : describe.skip)("Integration - Postgres", () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("connects and can query", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    expect(result).toBeDefined();
  });
});
