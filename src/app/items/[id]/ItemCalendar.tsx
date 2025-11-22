"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Props = { itemId: number };

type Range = { start: string; end: string };

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ItemCalendar({ itemId }: Props) {
  const [busy, setBusy] = useState<Range[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/items/${itemId}/availability`)
      .then((r) => r.json())
      .then((data) => {
        setBusy(data.rentals ?? []);
        setLoading(false);
      })
      .catch(() => {
        setBusy([]);
        setError(true);
        setLoading(false);
      });
  }, [itemId, success]);
  const today = new Date();
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  function isBooked(date: Date) {
    const iso = toISO(date);
    return busy.some((r) => r.start <= iso && iso <= r.end);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
        <p className="text-sm text-red-800 dark:text-red-200">
          Error loading availability. Please refresh the page.
        </p>
      </div>
    );
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-100 dark:bg-rose-900/40 border border-rose-300 dark:border-rose-700"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const booked = isBooked(d);
          const isToday = toISO(d) === toISO(new Date());
          
          return (
            <div
              key={d.toISOString()}
              title={`${toISO(d)} - ${booked ? "Booked" : "Available"}`}
              className={`
                relative text-center text-xs rounded-lg px-2 py-3 transition-all duration-200
                ${isToday ? "ring-2 ring-fuchsia-500" : ""}
                ${
                  booked
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 border border-rose-300 dark:border-rose-700"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 cursor-pointer"
                }
              `}
            >
              <div className="font-semibold">{d.getDate()}</div>
              <div className="text-[10px] opacity-70">
                {d.toLocaleDateString(undefined, { month: "short" })}
              </div>
              {booked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[10px] font-semibold bg-rose-600 text-white px-1 rounded">
                    ✕
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
