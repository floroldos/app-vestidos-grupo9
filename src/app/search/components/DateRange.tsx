"use client";

import { useState, ChangeEvent } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays } from "lucide-react";

type Props = {
    start?: string;
    end?: string;
};

export default function DateRange({ start, end }: Props) {
    const [startDate, setStartDate] = useState<Date | null>(
        start ? new Date(start) : null
    );
    const [endDate, setEndDate] = useState<Date | null>(
        end ? new Date(end) : null
    );
    const [error, setError] = useState<string | null>(null);

    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6); // 👉 exactamente 6 meses hacia adelante

    const blockTyping = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
    };

    const handleStart = (d: Date | null) => {
        setError(null);
        setStartDate(d);

        // Si elegís un start después del end → reseteo + error
        if (endDate && d && endDate < d) {
            setEndDate(null);
            setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
        }
    };

    const handleEnd = (d: Date | null) => {
        setError(null);

        // Si se elige un end sin start, error
        if (!startDate && d) {
            setError("Debes elegir una fecha de inicio primero.");
            return;
        }

        if (startDate && d && d < startDate) {
            setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
            return;
        }

        setEndDate(d);
    };

    return (
        <div className="flex flex-col gap-3">

            {/* ERROR MESSAGE */}
            {error && (
                <p className="text-sm text-red-600 bg-red-100 border border-red-300 py-2 px-3 rounded-lg">
                    {error}
                </p>
            )}

            {/* START DATE */}
            <div className="relative">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                <DatePicker
                    selected={startDate}
                    onChange={handleStart}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Start date"
                    minDate={today}
                    maxDate={maxDate}
                    showPopperArrow={false}
                    calendarStartDay={1}
                    className="w-full rounded-xl border border-slate-300 bg-white px-10 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-black/20"
                    name="start"
                    preventOpenOnFocus
                    onChangeRaw={(e: any) => e.preventDefault()}

                />
                <input
                    type="hidden"
                    name="start"
                    value={startDate ? startDate.toISOString().split("T")[0] : ""}
                />
            </div>

            {/* END DATE */}
            <div className="relative">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                <DatePicker
                    selected={endDate}
                    onChange={handleEnd}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="End date"
                    minDate={startDate || today}
                    maxDate={maxDate}
                    showPopperArrow={false}
                    calendarStartDay={1}
                    className="w-full rounded-xl border border-slate-300 bg-white px-10 py-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-black/20"
                    name="end"
                    preventOpenOnFocus
                    onChangeRaw={(e: any) => e.preventDefault()}
                />
                <input
                    type="hidden"
                    name="end"
                    value={endDate ? endDate.toISOString().split("T")[0] : ""}
                />
            </div>
        </div>
    );
}
