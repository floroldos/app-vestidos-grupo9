"use client";

import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";

type Props = {
    defaultStart?: string;
    defaultEnd?: string;
};

export default function DateRangePicker({ defaultStart, defaultEnd }: Props) {
    const [start, setStart] = useState(defaultStart || "");
    const [end, setEnd] = useState(defaultEnd || "");
    const [error, setError] = useState("");

    const today = new Date();
    const max = new Date();
    max.setMonth(max.getMonth() + 6);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    useEffect(() => {
        if (start && end && end < start) {
            setError("End date can't be earlier than start date.");
        } else {
            setError("");
        }
    }, [start, end]);

    return (
        <div className="flex flex-col gap-3 col-span-1 sm:col-span-2 lg:col-span-2">
            {/* START */}
            <div className="relative">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                    type="date"
                    name="start"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    min={formatDate(today)}
                    max={formatDate(max)}
                    className="w-full rounded-xl border px-10 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
            </div>

            {/* END */}
            <div className="relative">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                    type="date"
                    name="end"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    min={start || formatDate(today)}
                    max={formatDate(max)}
                    className="w-full rounded-xl border px-10 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
            </div>

            {error && (
                <p className="text-xs text-red-600 -mt-2">{error}</p>
            )}
        </div>
    );
}
