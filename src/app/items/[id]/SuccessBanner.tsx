"use client";

import { useSearchParams } from "next/navigation";

export function SuccessBanner() {
    const searchParams = useSearchParams();
    const success = searchParams.get("success");

    if (!success) return null;

    return (
        <div className="mb-6 rounded-xl border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-4">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✓ Reservation completed!
            </p>
        </div>
    );
}
