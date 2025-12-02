"use client";

import React, { useEffect, useState } from "react";
import EditItemModal from "../../components/EditItemModal";
import AddItemModal from "../../components/AddItemModal";

type AdminItem = {
  id: number | string;
  name: string;
  category: string;
  sizes: string[];
  pricePerDay: number;
  color?: string;
  style?: string;
  description?: string;
  images?: string[];
  alt?: string;
};

type Rental = {
  id: string;
  itemId: number;
  start: string;
  end: string;
  customer: { name: string; email: string; phone: string };
  createdAt: string;
  status: "active" | "canceled";
};

type CreateForm = {
  name: string;
  category: "dress" | "shoes" | "bag" | "jacket";
  sizes: string;
  pricePerDay: number;
  color?: string;
  description?: string;
};

export default function AdminDashboard({ csrf }: { csrf: string }) {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<AdminItem | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [itemsRes, rentalsRes] = await Promise.all([
        fetch("/api/admin/items", { credentials: "same-origin" }),
        fetch("/api/admin/rentals", { credentials: "same-origin" }),
      ]);
      if (!itemsRes.ok) throw new Error("Failed to load items");
      if (!rentalsRes.ok) throw new Error("Failed to load rentals");

      const itemsData = await itemsRes.json();
      const rentalsData = await rentalsRes.json();

      setItems(itemsData.items ?? []);
      setRentals(rentalsData.rentals ?? []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  // Cancel rental
  async function handleCancelRental(rid: string) {
    try {
      const res = await fetch(`/api/admin/rentals/${rid}/cancel`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csrf }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancel failed");
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    }
  }

  // Delete item
  async function handleDelete(id: number | string) {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/items/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csrf }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setItems((s) => s.filter((i) => i.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function openEditModal(item: AdminItem) {
    setEditItem(item);
    setShowEditModal(true);
  }


  async function handleUpdateItem(data: AdminItem & { csrf?: string }) {
    try {
      const res = await fetch(`/api/admin/items/${data.id}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csrf,
          name: data.name,
          category: data.category,
          sizes: data.sizes,
          pricePerDay: data.pricePerDay,
          color: data.color,
          style: data.style,
          description: data.description,
          images: data.images,
          alt: data.alt,
        }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Update failed");
      setItems((s) => s.map((x) => (x.id === responseData.item.id ? responseData.item : x)));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
      throw err; 
    }
  }
  async function handleCreateItem(data: Omit<AdminItem, "id"> & { csrf?: string }) {
    try {
      const res = await fetch("/api/admin/items", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csrf,
          name: data.name,
          category: data.category,
          sizes: data.sizes,
          pricePerDay: data.pricePerDay,
          color: data.color,
          style: data.style,
          description: data.description,
          images: data.images,
          alt: data.alt,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed to create");

      setItems((s) => [...s, responseData.item]);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Create failed");
      throw err;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-fuchsia-600 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              GR
            </div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-600 to-rose-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button className="text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-fuchsia-200 dark:border-fuchsia-900 border-t-fuchsia-600 dark:border-t-fuchsia-400 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading dashboard...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>

        {/* INVENTORY */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage your catalog of items</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-700 hover:to-rose-700 text-white px-5 py-2.5 text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              + Add item
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">ID</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Name</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Category</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Sizes</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Price</th>
                    <th className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={String(i.id)} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{i.id}</td>
                      <td className="py-3 px-4 font-medium">{i.name}</td>
                      <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-400">{i.category}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{(i.sizes || []).join(", ")}</td>
                      <td className="py-3 px-4 font-semibold text-fuchsia-600 dark:text-fuchsia-400">${i.pricePerDay}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => openEditModal(i)}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(i.id)}
                            className="rounded-lg border border-red-200 dark:border-red-900/50 hover:border-red-500 dark:hover:border-red-500 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td className="py-12 text-center text-slate-500" colSpan={6}>
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <p className="font-medium">No items yet</p>
                          <p className="text-sm">Click "Add item" to create your first product</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* RENTALS */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Scheduled Rentals</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">View and manage upcoming reservations</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Rental ID</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Item</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Dates</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Customer</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                          {r.id.slice(0, 8)}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-400">#{r.itemId}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <span>{r.start}</span>
                          <span className="text-slate-400">→</span>
                          <span>{r.end}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{r.customer.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                          {r.customer.email} • {r.customer.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.status === "active" 
                            ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {r.status === "active" ? (
                          <button
                            onClick={() => handleCancelRental(r.id)}
                            className="rounded-lg border border-orange-200 dark:border-orange-900/50 hover:border-orange-500 dark:hover:border-orange-500 px-3 py-1.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all"
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
                      <td className="py-12 text-center text-slate-500" colSpan={6}>
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="font-medium">No rentals yet</p>
                          <p className="text-sm">Reservations will appear here once customers book items</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        </>
        )}
      </div>

      {/* ADD ITEM MODAL */}
      <AddItemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateItem}
      />

      {/* EDIT MODAL */}
      <EditItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditItem(null);
        }}
        item={editItem}
        onSubmit={handleUpdateItem}
      />
    </div>
  );
}