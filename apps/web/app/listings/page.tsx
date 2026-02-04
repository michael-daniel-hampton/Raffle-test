"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, Listing } from "@raffle/shared";

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .listListings("ACTIVE")
      .then(setListings)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Active Listings</h2>
        <p className="text-sm text-slate-400">Browse raffles that are currently open.</p>
      </div>
      {error && <div className="rounded border border-red-500 bg-red-950 p-3 text-sm">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        {listings.map((listing) => (
          <div key={listing.id} className="rounded border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-lg font-semibold">{listing.title}</h3>
            <p className="text-sm text-slate-400">{listing.category}</p>
            <div className="mt-3 text-sm">
              <div>
                {listing.ticketPrice} {listing.currency} per ticket
              </div>
              <div>
                Tickets sold: {listing.ticketsSold} / {listing.thresholdCount}
              </div>
              <div>Status: {listing.status}</div>
            </div>
            <Link
              className="mt-4 inline-flex rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              href={`/listings/${listing.id}`}
            >
              View details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
