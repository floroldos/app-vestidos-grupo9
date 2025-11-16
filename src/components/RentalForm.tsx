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

  function validateDates(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    return s < e;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const start = formData.get("start") as string;
    const end = formData.get("end") as string;

    if (!validateDates(start, end)) {
      setError("The end date must be later than the start date.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        body: formData,
      });

      let data: any = null;

      if (!response.ok) {
        try {
          data = await response.json();
        } catch (_) {}

        if (response.status === 409) {
          setError("The selected dates are already booked. Please choose a different date range.");
        } else if (data?.error) {
          setError(data.error);
        } else {
          setError("An error occurred. Please try again.");
        }

        setLoading(false);
        e.currentTarget.reset();
        alert("Rental request submitted successfully!");
        router.push(`/items/${itemId}?success=1`);
        router.refresh();
        return;
      }      

    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border p-4">
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="csrf" value={csrf} />

        <div className="sm:col-span-2">
          <input
            id="name"
            name="name"
            required
            placeholder="Full name"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        <div>
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
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{7,15}"
            title="Phone number must contain between 7 and 15 digits."
            required
            placeholder="Phone"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        <div>
          <input
            id="start"
            name="start"
            type="date"
            required
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        <div>
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
                      inStock
                        ? "cursor-pointer hover:bg-slate-50"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={size}
                      disabled={!inStock}
                      required
                      className="h-4 w-4"
                    />
                    <span>{size}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-xl bg-fuchsia-600 text-white px-6 py-3 text-sm font-semibold"
          >
            {loading ? "Processing..." : "Request rental"}
          </button>
        </div>
      </form>
    </>
  );
}
