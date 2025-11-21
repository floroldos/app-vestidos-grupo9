"use client";

import React, { useState, useEffect } from "react";

// ---- Tipos ----
interface AvailabilityRange {
  start: string;
  end: string;
}

interface AvailabilityResponse {
  availability: AvailabilityRange[];
}

// ---- Componente ----
export default function ItemCalendar({ itemId }: { itemId: number }) {
  const [availability, setAvailability] = useState<AvailabilityRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        setLoading(true);

        const res = await fetch(`/api/items/${itemId}/availability`);
        if (!res.ok) throw new Error("No se pudo cargar disponibilidad");

        const data: AvailabilityResponse = await res.json();
        setAvailability(data.availability ?? []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error desconocido";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [itemId]);

  if (loading) return <p>Cargando disponibilidad...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4 border rounded-xl shadow bg-white w-full max-w-xl">
      <h2 className="text-xl font-bold mb-2">
        Disponibilidad del ítem #{itemId}
      </h2>

      <div className="grid grid-cols-1 gap-2">
        {availability.length === 0 && (
          <p className="text-sm text-gray-600">
            Este ítem está completamente disponible.
          </p>
        )}

        {availability.map((range, idx) => (
          <div
            key={idx}
            className="p-2 bg-red-100 rounded-lg border border-red-300"
          >
            <p className="text-sm font-medium text-red-700">OCUPADO</p>
            <p className="text-xs text-gray-700">
              {range.start} → {range.end}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
