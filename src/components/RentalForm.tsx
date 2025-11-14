"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ALL_SIZES = ["XS", "S", "M", "L", "XL"];

interface RentalFormProps {
  itemId: number;
  csrf: string;
  availableSizes?: string[];
}

export function RentalForm({ itemId, csrf, availableSizes = [] }: RentalFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const available = new Set(availableSizes.map((s: string) => s.toUpperCase()));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Set user-friendly error message based on status
        if (response.status === 409) {
          setError("The selected dates are already booked. Please choose a different date range.");
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("An error occurred. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Success - redirect to item page with success message
      router.push(`/items/${itemId}?success=1`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border p-4">
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="csrf" value={csrf} />

        <div className="sm:col-span-2">
          <label className="sr-only" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Full name"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{7,15}"
            required
            placeholder="Phone"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="start">
            Start date
          </label>
          <input
            id="start"
            name="start"
            type="date"
            required
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="end">
            End date
          </label>
          <input
            id="end"
            name="end"
            type="date"
            required
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium">Size</legend>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => {
                const inStock = available.has(size);
                return (
                  <label
                    key={size}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      inStock ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={size}
                      disabled={!inStock}
                      required
                      className="h-4 w-4"
                      aria-describedby={!inStock ? `size-${size}-hint` : undefined}
                    />
                    <span>{size}</span>
                    {!inStock && (
                      <span
                        id={`size-${size}-hint`}
                        className="ml-1 rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-100"
                      >
                        Not available
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">Please select an available size to continue.</p>
          </fieldset>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-xl bg-fuchsia-600 text-white px-6 py-3 text-sm font-semibold hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Request rental"}
          </button>
        </div>
      </form>
    </>
  );
}
