"use client";

import { useEffect, useState } from "react";
import { apiClient, Listing } from "@raffle/shared";

export default function SellerListingDetailPage({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    ticket_price: 0,
    currency: "EUR",
    threshold_count: 0,
    end_date: "",
  });

  const load = () => {
    apiClient
      .getListing(params.id)
      .then((data) => {
        setListing(data);
        setForm({
          title: data.title,
          description: data.description,
          category: data.category,
          ticket_price: data.ticketPrice,
          currency: data.currency,
          threshold_count: data.thresholdCount,
          end_date: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : "",
        });
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setError(null);
    setMessage(null);
    try {
      const updated = await apiClient.updateListing(params.id, {
        title: form.title,
        description: form.description,
        category: form.category,
        ticket_price: form.ticket_price,
        currency: form.currency,
        threshold_count: form.threshold_count,
        end_date: form.end_date || undefined,
      });
      setListing(updated);
      setMessage("Draft updated.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const activate = async () => {
    setError(null);
    setMessage(null);
    try {
      const updated = await apiClient.activateListing(params.id);
      setListing(updated);
      setMessage("Listing activated.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!listing) {
    return <div className="text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Manage Listing</h2>
        <p className="text-sm text-slate-400">Only drafts are editable and activatable.</p>
      </div>
      <div className="rounded border border-slate-800 bg-slate-900 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Title
            <input
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </label>
          <label className="text-sm">
            Category
            <input
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            />
          </label>
          <label className="text-sm md:col-span-2">
            Description
            <textarea
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1"
              rows={4}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <label className="text-sm">
            Ticket price (minor units)
            <input
              type="number"
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1"
              value={form.ticket_price}
              onChange={(event) => setForm({ ...form, ticket_price: Number(event.target.value) })}
            />
          </label>
          <label className="text-sm">
            Currency
            <input
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1"
              value={form.currency}
              onChange={(event) => setForm({ ...form, currency: event.target.value })}
            />
          </label>
          <label className="text-sm">
            Threshold count
            <input
              type="number"
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1"
              value={form.threshold_count}
              onChange={(event) => setForm({ ...form, threshold_count: Number(event.target.value) })}
            />
          </label>
          <label className="text-sm">
            End date (optional)
            <input
              type="datetime-local"
              className="mt-1 w-full rounded bg-slate-800 px-2 py-1"
              value={form.end_date}
              onChange={(event) => setForm({ ...form, end_date: event.target.value })}
            />
          </label>
        </div>
        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        {message && <div className="mt-3 text-sm text-emerald-400">{message}</div>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600"
            onClick={save}
            type="button"
            disabled={listing.status !== "DRAFT"}
          >
            Save changes
          </button>
          <button
            className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            onClick={activate}
            type="button"
            disabled={listing.status !== "DRAFT"}
          >
            Activate listing
          </button>
        </div>
      </div>
    </div>
  );
}
