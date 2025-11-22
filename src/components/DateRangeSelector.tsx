"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
    start?: string;
    end?: string;
};

export default function DateRangeSelector({ start, end }: Props) {
    const [range, setRange] = useState<[Date | null, Date | null]>([
        start ? new Date(start) : null,
        end ? new Date(end) : null,
    ]);

    const [startDate, endDate] = range;

    const minDate = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);

    return (
        <div className="relative w-full">
            {/* Ícono blanco */}
            <CalendarDays
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 
                text-white z-20 pointer-events-none"
            />

            <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setRange(update)}
                minDate={minDate}
                maxDate={maxDate}
                monthsShown={2}
                placeholderText="Select date range"
                dateFormat="yyyy-MM-dd"
                portalId="datepicker-root"
                popperClassName="z-[999999]"
                className="w-full pl-10 rounded-xl border px-3 py-2 text-sm 
                bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 
                outline-none focus:ring-2 focus:ring-fuchsia-500 z-10 relative"
            />

            {/* Hidden GET fields */}
            {startDate && (
                <input
                    type="hidden"
                    name="start"
                    value={startDate.toISOString().split("T")[0]}
                />
            )}
            {endDate && (
                <input
                    type="hidden"
                    name="end"
                    value={endDate.toISOString().split("T")[0]}
                />
            )}
        </div>
    );
}
