"use client";

import { useState } from "react";
import { apiClient } from "@raffle/shared";
import { useRouter } from "next/navigation";

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    ticket_price: 100,
    currency: "EUR",
    threshold_count: 100,
    end_date: "",
  });
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      const listing = await apiClient.createListing({
        ...form,
        end_date: form.end_date || undefined,
      });
      router.push(`/seller/listings/${listing.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Create Draft Listing</h2>
        <p className="text-sm text-slate-400">Save as draft and activate when ready.</p>
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
        <button
          className="mt-4 rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          onClick={submit}
          type="button"
        >
          Save draft
        </button>
      </div>
    </div>
  );
}
