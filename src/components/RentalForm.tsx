"use client";

import { useState, useEffect } from "react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL"];

interface RentalFormProps {
  itemId: number;
  csrf: string;
  availableSizes?: string[];
}

export function RentalForm({ itemId, csrf, availableSizes = [] }: RentalFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const available = new Set(availableSizes.map((s: string) => s.toUpperCase()));

  const today = new Date().toISOString().split('T')[0];

  // Check availability when both dates are selected
  useEffect(() => {
    if (startDate && endDate && startDate <= endDate) {
      checkAvailability(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  async function checkAvailability(start: string, end: string) {
    setCheckingAvailability(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/items/${itemId}/availability`);
      if (!response.ok) {
        setCheckingAvailability(false);
        return;
      }

      const data = await response.json();
      const rentals = data.rentals ?? [];
      
      // Check if selected dates overlap with any existing rental
      const hasOverlap = rentals.some((rental: { start: string; end: string }) => {
        return !(end < rental.start || start > rental.end);
      });

      if (hasOverlap) {
        setError("Fecha no disponible, por favor seleccione otra.");
      }
    } catch {
      // Silently fail - validation will happen on submit anyway
    } finally {
      setCheckingAvailability(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const startDate = formData.get('start')?.toString();
    const endDate = formData.get('end')?.toString();

    if (startDate && startDate < today) {
      setError("Invalid date. Select a start date later than today.");
      setLoading(false);
      return;
    }

    if (endDate && endDate < today) {
      setError("Invalid date. Select an end date later than today.");
      setLoading(false);
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError("End date must be later than start date.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let data: { error?: string } = {};
        try {
          data = await response.json();
        } catch {
        }

        if (response.status === 409) {
          setError("The selected dates are already booked. Please choose a different date range.");
        } else if (data?.error) {
          setError(data.error);
        } else {
          setError("An error occurred. Please try again.");
        }
        setLoading(false);
        return;
      }

      setLoading(false);
      setTimeout(() => {
        window.location.href = `/items/${itemId}?success=1`;
      }, 300);
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {checkingAvailability && (
        <div className="mb-4 rounded-xl border border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
            Checking availability...
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {!error && !checkingAvailability && startDate && endDate && startDate <= endDate && (
        <div className="mb-4 rounded-xl border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
            ✓ Dates are available
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
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
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 sm:py-3 text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-fuchsia-500 outline-none"
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
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 sm:py-3 text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-fuchsia-500 outline-none"
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
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 sm:py-3 text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-fuchsia-500 outline-none"
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
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 sm:py-3 text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-fuchsia-500 outline-none"
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
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 sm:py-3 text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-fuchsia-500 outline-none"
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
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${inStock ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" : "opacity-50 cursor-not-allowed"
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

        <div className="sm:col-span-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-700 hover:to-rose-700 text-white px-6 py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          >
            {loading ? "Processing..." : "Request rental"}
          </button>
        </div>
      </form>
    </>
  );
}
