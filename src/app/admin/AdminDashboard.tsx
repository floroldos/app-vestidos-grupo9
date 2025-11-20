"use client";
import React, { useEffect, useState } from "react";

type AdminItem = {
  id: number | string;
  name: string;
  category: string;
  sizes: string[];
  pricePerDay: number;
  color?: string;
  style?: string;
  description?: string;
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

export default function AdminDashboard({ csrf }: { csrf: string }) {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit form state
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState<AdminItem | null>(null);

  // New item form
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("dress");
  const [newSizes, setNewSizes] = useState("");
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [newColor, setNewColor] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (err: any) {
      setError(err?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const sizes = newSizes.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/admin/items", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csrf,
          name: newName,
          category: newCategory,
          sizes,
          pricePerDay: Number(newPrice),
          color: newColor,
          description: newDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");

      setItems((s) => [data.item, ...s]);
      setNewName("");
      setNewCategory("dress");
      setNewSizes("");
      setNewPrice("");
      setNewColor("");
      setNewDescription("");
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Create failed");
    }
  }

  function openEdit(it: AdminItem) {
    setEditItem(it);
    setShowEdit(true);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    try {
      const res = await fetch(`/api/admin/items/${editItem.id}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csrf,
          name: editItem.name,
          category: editItem.category,
          sizes: editItem.sizes,
          pricePerDay: editItem.pricePerDay,
          color: editItem.color,
          description: editItem.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setItems((s) => s.map((x) => (x.id === data.item.id ? data.item : x)));
      setShowEdit(false);
      setEditItem(null);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Update failed");
    }
  }

  async function handleDelete(id: number | string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
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
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Delete failed");
    }
  }

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
    } catch (err: any) {
      setError(err?.message ?? "Cancel failed");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <form action="/api/admin/logout" method="POST">
          <button className="text-sm rounded-lg border px-3 py-2">Sign out</button>
        </form>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Inventory</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage items: add, edit and delete from the catalog.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <form onSubmit={handleCreate} className="col-span-1 rounded-lg border p-4">
            <h3 className="font-medium mb-2">Add new item</h3>
            <label className="block text-xs">Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full rounded-md border px-2 py-1 mb-2" />
            <label className="block text-xs">Category</label>
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full rounded-md border px-2 py-1 mb-2">
              <option value="dress">dress</option>
              <option value="shoes">shoes</option>
              <option value="bag">bag</option>
              <option value="jacket">jacket</option>
            </select>
            <label className="block text-xs">Sizes (comma separated)</label>
            <input value={newSizes} onChange={(e) => setNewSizes(e.target.value)} className="w-full rounded-md border px-2 py-1 mb-2" placeholder="S, M, L" />
            <label className="block text-xs">Price / day</label>
            <input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border px-2 py-1 mb-2" />
            <label className="block text-xs">Color</label>
            <input value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-full rounded-md border px-2 py-1 mb-2" />
            <label className="block text-xs">Description</label>
            <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full rounded-md border px-2 py-1 mb-2" />
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-fuchsia-600 text-white px-3 py-1">Create</button>
              <button type="button" onClick={() => { setNewName(""); setNewCategory("dress"); setNewSizes(""); setNewPrice(""); setNewColor(""); setNewDescription(""); }} className="rounded-lg border px-3 py-1">Reset</button>
            </div>
          </form>

          <div className="md:col-span-2">
            {loading ? <div>Loading...</div> : null}
            {error ? <div className="text-rose-600 mb-2">{error}</div> : null}

            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Sizes</th>
                    <th className="py-2 pr-4">Price/day</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={String(i.id)} className="border-t">
                      <td className="py-2 pr-4">{i.id}</td>
                      <td className="py-2 pr-4">{i.name}</td>
                      <td className="py-2 pr-4">{i.category}</td>
                      <td className="py-2 pr-4">{(i.sizes || []).join(", ")}</td>
                      <td className="py-2 pr-4">${i.pricePerDay}</td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(i)} className="rounded-lg border px-3 py-1 hover:bg-slate-50">Edit</button>
                          <button onClick={() => handleDelete(i.id)} className="rounded-lg border px-3 py-1 hover:bg-slate-50">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td className="py-3 text-slate-500" colSpan={6}>No items yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">Scheduled rentals</h2>
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
              {rentals.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-4">{r.id.slice(0, 8)}</td>
                  <td className="py-2 pr-4">{String(r.itemId)}</td>
                  <td className="py-2 pr-4">{r.start} → {r.end}</td>
                  <td className="py-2 pr-4">
                    {r.customer.name}
                    <div className="text-slate-500 text-xs">{r.customer.email} • {r.customer.phone}</div>
                  </td>
                  <td className="py-2 pr-4 capitalize">{r.status}</td>
                  <td className="py-2 pr-4">
                    {r.status === "active" ? (
                      <button onClick={() => handleCancelRental(r.id)} className="rounded-lg border px-3 py-1 hover:bg-slate-50">Cancel</button>
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
      </section>

      {showEdit && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowEdit(false); setEditItem(null); }} />
          <form onSubmit={handleUpdate} className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-lg p-6 border">
            <h3 className="font-medium mb-3">Edit item #{editItem.id}</h3>
            <label className="block text-xs">Name</label>
            <input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className="w-full rounded-md border px-2 py-1 mb-2" />
            <label className="block text-xs">Category</label>
            <select value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value as any })} className="w-full rounded-md border px-2 py-1 mb-2">
              <option value="dress">dress</option>
              <option value="shoes">shoes</option>
              <option value="bag">bag</option>
              <option value="jacket">jacket</option>
            </select>
            <label className="block text-xs">Sizes (comma separated)</label>
            <input value={(editItem.sizes || []).join(", ")} onChange={(e) => setEditItem({ ...editItem, sizes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="w-full rounded-md border px-2 py-1 mb-2" />
            <label className="block text-xs">Price / day</label>
            <input type="number" value={editItem.pricePerDay} onChange={(e) => setEditItem({ ...editItem, pricePerDay: Number(e.target.value) })} className="w-full rounded-md border px-2 py-1 mb-2" />
            <label className="block text-xs">Color</label>
            <input value={editItem.color ?? ""} onChange={(e) => setEditItem({ ...editItem, color: e.target.value })} className="w-full rounded-md border px-2 py-1 mb-2" />
            <label className="block text-xs">Description</label>
            <textarea value={editItem.description ?? ""} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} className="w-full rounded-md border px-2 py-1 mb-2" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowEdit(false); setEditItem(null); }} className="rounded-lg border px-3 py-1">Cancel</button>
              <button type="submit" className="rounded-lg bg-fuchsia-600 text-white px-3 py-1">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
