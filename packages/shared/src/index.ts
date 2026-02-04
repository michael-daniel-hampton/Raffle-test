export type ListingStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "CANCELLED";

export type Listing = {
  id: string;
  sellerAliasId: string;
  title: string;
  description: string;
  category: string;
  ticketPrice: number;
  currency: string;
  thresholdCount: number;
  endDate: string | null;
  status: ListingStatus;
  ticketsSold: number;
  createdAt: string;
  updatedAt: string;
  odds?: number;
  outcome?: {
    listingId: string;
    winnerAliasId: string;
    rngMethod: string;
    rngSeedHash: string;
    createdAt: string;
  } | null;
};

export type PurchaseResponse = {
  listing: Listing;
  purchase: {
    id: string;
    listingId: string;
    buyerAliasId: string;
    qty: number;
    status: string;
    createdAt: string;
  };
  ranges: Array<{ id: string; startTicket: number; endTicket: number }>;
  idempotent: boolean;
};

export type CreateListingDto = {
  title: string;
  description: string;
  category: string;
  ticket_price: number;
  currency?: string;
  threshold_count: number;
  end_date?: string;
};

export type UpdateListingDto = Partial<CreateListingDto>;

export type PurchaseTicketsDto = {
  qty: number;
  idempotency_key?: string;
};

const DEV_ALIAS_KEY = "dev_alias_id";
const DEV_KYC_KEY = "dev_kyc_verified";

export const devSessionStorage = {
  keys: {
    aliasId: DEV_ALIAS_KEY,
    kycVerified: DEV_KYC_KEY,
  },
  get() {
    if (typeof window === "undefined") return null;
    const aliasId = window.localStorage.getItem(DEV_ALIAS_KEY);
    const kycVerified = window.localStorage.getItem(DEV_KYC_KEY);
    if (!aliasId) return null;
    return { aliasId, kycVerified: kycVerified === "true" };
  },
  set(aliasId: string, kycVerified: boolean) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DEV_ALIAS_KEY, aliasId);
    window.localStorage.setItem(DEV_KYC_KEY, String(kycVerified));
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(DEV_ALIAS_KEY);
    window.localStorage.removeItem(DEV_KYC_KEY);
  },
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
};

const buildHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const session = devSessionStorage.get();
  if (session) {
    headers["X-DEV-ALIAS-ID"] = session.aliasId;
    headers["X-DEV-KYC-VERIFIED"] = String(session.kycVerified);
  }
  return headers;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  return response.json();
}

export const apiClient = {
  async listListings(status?: ListingStatus): Promise<Listing[]> {
    const query = status ? `?status=${status}` : "";
    const response = await fetch(`${getBaseUrl()}/v1/listings${query}`);
    return handleResponse<Listing[]>(response);
  },
  async getListing(id: string): Promise<Listing> {
    const response = await fetch(`${getBaseUrl()}/v1/listings/${id}`);
    return handleResponse<Listing>(response);
  },
  async listSellerListings(): Promise<Listing[]> {
    const response = await fetch(`${getBaseUrl()}/v1/listings/seller/me`, {
      headers: buildHeaders(),
    });
    return handleResponse<Listing[]>(response);
  },
  async createListing(dto: CreateListingDto): Promise<Listing> {
    const response = await fetch(`${getBaseUrl()}/v1/listings`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(dto),
    });
    return handleResponse<Listing>(response);
  },
  async updateListing(id: string, dto: UpdateListingDto): Promise<Listing> {
    const response = await fetch(`${getBaseUrl()}/v1/listings/${id}`, {
      method: "PATCH",
      headers: buildHeaders(),
      body: JSON.stringify(dto),
    });
    return handleResponse<Listing>(response);
  },
  async activateListing(id: string): Promise<Listing> {
    const response = await fetch(`${getBaseUrl()}/v1/listings/${id}/activate`, {
      method: "POST",
      headers: buildHeaders(),
    });
    return handleResponse<Listing>(response);
  },
  async purchaseTickets(id: string, dto: PurchaseTicketsDto): Promise<PurchaseResponse> {
    const response = await fetch(`${getBaseUrl()}/v1/listings/${id}/tickets/purchase`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(dto),
    });
    return handleResponse<PurchaseResponse>(response);
  },
};
