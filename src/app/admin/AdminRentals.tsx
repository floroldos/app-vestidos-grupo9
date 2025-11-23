"use client";

import { useState, useEffect } from "react";

type Rental = {
    id: string;
    itemId: number;
    start: string;
    end: string;
    customer: { name: string; email: string; phone: string };
    status: string;
};

type Props = {
    csrf: string;
};

export default function AdminRentals({ csrf }: Props) {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar rentals desde la API
    async function loadRentals() {
        const res = await fetch("/api/admin/rentals");
        if (!res.ok) return setRentals([]);
        const data = await res.json();
        setRentals(data.rentals ?? []);
        setLoading(false);
    }

    useEffect(() => {
        loadRentals();
    }, []);

    // Cancelar rental
    async function cancelRental(id: string) {
        const res = await fetch(`/api/admin/rentals/${id}/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ csrf }),
        });
        if (res.ok) {
            // Quitar rental cancelado de la lista
            setRentals(rentals.map(r => r.id === id ? { ...r, status: "cancelled" } : r));
        } else {
            const err = await res.json();
            alert(err.error || "Error cancelling rental");
        }
    }

    if (loading) return <p>Loading rentals...</p>;

    return (
        <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="text-left">
                        <th className="py-2 pr-4">Rental ID</th>
                        <th className="py-2 pr-4">Item</th>
                        <th className="py-2 pr-4">Dates</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rentals.map(r => (
                        <tr key={r.id} className="border-t">
                            <td className="py-2 pr-4">{r.id.slice(0, 8)}</td>
                            <td className="py-2 pr-4">{r.itemId}</td>
                            <td className="py-2 pr-4">{r.start} → {r.end}</td>
                            <td className="py-2 pr-4">
                                {r.customer.name}
                                <div className="text-slate-500 text-xs">
                                    {r.customer.email} • {r.customer.phone}
                                </div>
                            </td>
                            <td className="py-2 pr-4 capitalize">{r.status}</td>
                            <td className="py-2 pr-4">
                                {r.status === "active" ? (
                                    <button
                                        className="rounded-lg border px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        onClick={() => cancelRental(r.id)}
                                    >
                                        Cancel
                                    </button>
                                ) : (
                                    <span className="text-slate-400">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {rentals.length === 0 && (
                        <tr>
                            <td className="py-3 text-slate-500" colSpan={6}>No rentals yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
