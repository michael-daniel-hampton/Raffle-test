"use client";

import { useEffect, useState } from "react";
import { apiClient, Listing } from "@raffle/shared";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    apiClient
      .getListing(params.id)
      .then(setListing)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const purchase = async () => {
    setError(null);
    setMessage(null);
    try {
      await apiClient.purchaseTickets(params.id, { qty });
      setMessage("Tickets purchased successfully.");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!listing) {
    return <div className="text-slate-400">Loading...</div>;
  }

  const progress = Math.min(100, Math.round((listing.ticketsSold / listing.thresholdCount) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{listing.title}</h2>
        <p className="text-sm text-slate-400">{listing.category}</p>
      </div>
      <div className="rounded border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-200">{listing.description}</p>
        <div className="mt-4 grid gap-2 text-sm text-slate-300">
          <div>
            Price: {listing.ticketPrice} {listing.currency}
          </div>
          <div>
            Tickets sold: {listing.ticketsSold} / {listing.thresholdCount}
          </div>
          <div>Status: {listing.status}</div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded bg-slate-800">
          <div className="h-full bg-indigo-600" style={{ width: `${progress}%` }} />
        </div>
      </div>
      {listing.status === "ACTIVE" && (
        <div className="rounded border border-slate-800 bg-slate-900 p-4">
          <h3 className="text-lg font-semibold">Purchase tickets</h3>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(event) => setQty(Number(event.target.value))}
              className="w-24 rounded bg-slate-800 px-2 py-1"
            />
            <button
              className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              onClick={purchase}
              type="button"
            >
              Buy tickets
            </button>
          </div>
          {message && <div className="mt-3 text-sm text-emerald-400">{message}</div>}
          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        </div>
      )}
      {listing.status === "CLOSED" && listing.outcome && (
        <div className="rounded border border-emerald-600 bg-emerald-950 p-4">
          <h3 className="text-lg font-semibold">Winner selected</h3>
          <p className="text-sm text-emerald-200">
            Winner alias: {listing.outcome.winnerAliasId} (drawn {new Date(listing.outcome.createdAt).toLocaleString()})
          </p>
        </div>
      )}
    </div>
  );
}
