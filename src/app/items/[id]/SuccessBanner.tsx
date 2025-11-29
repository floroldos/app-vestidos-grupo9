"use client";

import { useSearchParams } from "next/navigation";

export function SuccessBanner() {
    const searchParams = useSearchParams();
    const success = searchParams.get("success");

    if (!success) return null;

    return (
        <div className="mb-6 rounded-2xl border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                        Reservation completed!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                        We'll confirm availability via email shortly.
                    </p>
                </div>
            </div>
        </div>
    );
}
