"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type AdminItem = {
  id: number | string;
  name: string;
  category: string;
  sizes: string[];
  pricePerDay: number;
  color?: string;
  description?: string;
  images?: string[];
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
  sizes: string; // comma-separated
  pricePerDay: number;
  color?: string;
  description?: string;
  // images handled separately via file input
};

export default function AdminDashboard({ csrf }: { csrf: string }) {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // edit state
  const [editItem, setEditItem] = useState<AdminItem | null>(null);

  // images state for create
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [createPreviews, setCreatePreviews] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<string | null>(null);
  const [busyCreate, setBusyCreate] = useState(false);

  // react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm<CreateForm>({
    defaultValues: {
      name: "",
      category: "dress",
      sizes: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pricePerDay: undefined as any,
      color: "",
      description: "",
    },
  });

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message ?? "Error");
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message ?? "Cancel failed");
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message ?? "Delete failed");
    }
  }

  function openEditModal(item: AdminItem) {
    setEditItem(item);
    setShowEditModal(true);
  }

  // Update item (simple PUT)
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
      setShowEditModal(false);
      setEditItem(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message ?? "Update failed");
    }
  }

  // Helper: convert File -> base64 dataURL
  function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Validate image dimensions (>=1080x1350)
  function validateImageDimensions(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const ok = img.width >= 1080 && img.height >= 1350;
        URL.revokeObjectURL(url);
        resolve(ok);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      img.src = url;
    });
  }

  // Handle file input change (create)
  async function handleCreateFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImageErrors(null);
    clearErrors("name"); // just to remove generic errors if any
    const files = Array.from(e.target.files ?? []);
    setCreateFiles(files);
    setCreatePreviews(files.map((f) => URL.createObjectURL(f)));
  }

  // Create item
  const onCreate = handleSubmit(async (vals) => {
    setImageErrors(null);

    // basic form validation (react-hook-form does most)
    // check images count
    if (createFiles.length < 3) {
      setImageErrors("You must upload at least 3 images.");
      return;
    }

    setBusyCreate(true);

    // validate dimensions for each file
    for (const f of createFiles) {
      const ok = await validateImageDimensions(f);
      if (!ok) {
        setImageErrors("All images must be at least 1080×1350 px.");
        setBusyCreate(false);
        return;
      }
    }

    try {
      // convert images to data-URL
      const imagesData = await Promise.all(createFiles.map((f) => fileToDataURL(f)));

      const sizes = vals.sizes.split(",").map((s) => s.trim()).filter(Boolean);

      const res = await fetch("/api/admin/items", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csrf,
          name: vals.name,
          category: vals.category,
          sizes,
          pricePerDay: Number(vals.pricePerDay),
          color: vals.color,
          description: vals.description,
          images: imagesData, // data-URL array
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");

      // prepend item
      setItems((s) => [data.item, ...s]);

      // cleanup
      reset();
      setCreateFiles([]);
      createPreviews.forEach((p) => URL.revokeObjectURL(p));
      setCreatePreviews([]);
      setShowCreateModal(false);
      setImageErrors(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message ?? "Create failed");
    } finally {
      setBusyCreate(false);
    }
  });

  // Close create modal
  function closeCreateForm() {
    setShowCreateModal(false);
    reset();
    setCreateFiles([]);
    createPreviews.forEach((p) => URL.revokeObjectURL(p));
    setCreatePreviews([]);
    setImageErrors(null);
  }

  // Small UI helpers for styling
  const fieldClass =
    "w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-fuchsia-500";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <form action="/api/admin/logout" method="POST">
          <button className="text-sm rounded-lg border px-3 py-2 bg-white dark:bg-slate-800">Sign out</button>
        </form>
      </div>

      {/* INVENTORY */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Inventory</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-fuchsia-600 text-white px-4 py-2 text-sm"
          >
            + Add item
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border dark:border-slate-700 bg-white/60 dark:bg-slate-900/60">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Sizes</th>
                <th className="py-2 px-3">Price</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={String(i.id)} className="border-t dark:border-slate-700">
                  <td className="py-2 px-3">{i.id}</td>
                  <td className="py-2 px-3">{i.name}</td>
                  <td className="py-2 px-3">{i.category}</td>
                  <td className="py-2 px-3">{(i.sizes || []).join(", ")}</td>
                  <td className="py-2 px-3">${i.pricePerDay}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      <button className="border rounded px-2 py-1" onClick={() => openEditModal(i)}>
                        Edit
                      </button>
                      <button className="border rounded px-2 py-1" onClick={() => handleDelete(i.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={6}>
                    No items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SPACER */}
      <div className="h-12" />

      {/* RENTALS */}
      <section>
        <h2 className="font-semibold">Scheduled rentals</h2>

        <div className="mt-3 overflow-x-auto rounded-lg border dark:border-slate-700 bg-white/60 dark:bg-slate-900/60">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 px-3">Rental ID</th>
                <th className="py-2 px-3">Item</th>
                <th className="py-2 px-3">Dates</th>
                <th className="py-2 px-3">Customer</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => (
                <tr key={r.id} className="border-t dark:border-slate-700">
                  <td className="py-2 px-3">{r.id.slice(0, 8)}</td>
                  <td className="py-2 px-3">{r.itemId}</td>
                  <td className="py-2 px-3">
                    {r.start} → {r.end}
                  </td>
                  <td className="py-2 px-3">
                    {r.customer.name}
                    <div className="text-xs text-slate-500">
                      {r.customer.email} • {r.customer.phone}
                    </div>
                  </td>
                  <td className="py-2 px-3 capitalize">{r.status}</td>
                  <td className="py-2 px-3">
                    {r.status === "active" ? (
                      <button
                        onClick={() => handleCancelRental(r.id)}
                        className="border rounded px-2 py-1"
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
                  <td className="py-4 text-slate-500" colSpan={6}>
                    No rentals yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-6">
          <div className="relative w-full max-w-2xl">
            <form
              onSubmit={onCreate}
              className="bg-white dark:bg-slate-900 rounded-lg p-6 border shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-medium text-lg">Add new item</h3>
                <button
                  type="button"
                  onClick={closeCreateForm}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs mb-1">Name</label>
                  <input
                    {...register("name", { required: "Name is required", minLength: { value: 2, message: "Too short" } })}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs mb-1">Category</label>
                  <select {...register("category", { required: true })} className="w-full rounded-md border px-3 py-2">
                    <option value="dress" className="bg-slate-900">dress</option>
                    <option value="shoes" className="bg-slate-900">shoes</option>
                    <option value="bag" className="bg-slate-900">bag</option>
                    <option value="jacket" className="bg-slate-900">jacket</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs mb-1">Sizes (comma separated)</label>
                  <input {...register("sizes", { required: "At least one size" })} className="w-full rounded-md border px-3 py-2" placeholder="S, M, L" />
                  {errors.sizes && <p className="text-xs text-rose-600 mt-1">{errors.sizes.message}</p>}
                </div>

                <div>
                  <label className="block text-xs mb-1">Price / day (UYU)</label>
                  <input {...register("pricePerDay", { required: "Price required", min: { value: 1, message: "Price must be > 0" } })} type="number" step="0.01" className="w-full rounded-md border px-3 py-2" />
                  {errors.pricePerDay && <p className="text-xs text-rose-600 mt-1">{errors.pricePerDay.message}</p>}
                </div>

                <div>
                  <label className="block text-xs mb-1">Color</label>
                  <input {...register("color")} className="w-full rounded-md border px-3 py-2" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs mb-1">Description (50–500 chars)</label>
                  <textarea {...register("description", { required: "Description required", minLength: { value: 50, message: "Min 50 chars" }, maxLength: { value: 500, message: "Max 500 chars" } })} className="w-full rounded-md border px-3 py-2 h-28" />
                  {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs mb-1">Images (min 3) — min 1080×1350 px</label>
                  <input type="file" accept="image/*" multiple onChange={handleCreateFilesChange} className="w-full rounded-md border px-3 py-2 text-sm cursor-pointer file:bg-fuchsia-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:cursor-pointer" />
                  {imageErrors && <p className="text-xs text-rose-600 mt-1">{imageErrors}</p>}

                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={closeCreateForm} className="border rounded px-3 py-1">Cancel</button>
                <button type="submit" disabled={busyCreate} className="bg-fuchsia-600 text-white rounded px-3 py-1">
                  {busyCreate ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-6">
          <div className="relative w-full max-w-md">
            <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-900 rounded-lg p-6 border shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Edit item #{editItem.id}</h3>
                <button type="button" onClick={() => { setShowEditModal(false); setEditItem(null); }} className="text-sm text-slate-500">Close</button>
              </div>

              <div className="mt-3">
                <label className="block text-xs mb-1">Name</label>
                <input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className="w-full rounded-md border px-3 py-2 mb-2" />

                <label className="block text-xs mb-1">Category</label>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <select value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value as any })} className="w-full rounded-md border px-3 py-2 mb-2 dark:bg-slate-800 text-slate-900">
                  <option value="dress">dress</option>
                  <option value="shoes">shoes</option>
                  <option value="bag">bag</option>
                  <option value="jacket">jacket</option>
                </select>

                <label className="block text-xs mb-1">Sizes</label>
                <input value={(editItem.sizes || []).join(", ")} onChange={(e) => setEditItem({ ...editItem, sizes: e.target.value.split(",").map(s => s.trim()) })} className="w-full rounded-md border px-3 py-2 mb-2" />

                <label className="block text-xs mb-1">Price</label>
                <input type="number" value={editItem.pricePerDay} onChange={(e) => setEditItem({ ...editItem, pricePerDay: Number(e.target.value) })} className="w-full rounded-md border px-3 py-2 mb-2" />

                <label className="block text-xs mb-1">Color</label>
                <input value={editItem.color ?? ""} onChange={(e) => setEditItem({ ...editItem, color: e.target.value })} className="w-full rounded-md border px-3 py-2 mb-2" />

                <label className="block text-xs mb-1">Description</label>
                <textarea value={editItem.description ?? ""} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} className="w-full rounded-md border px-3 py-2 mb-4" />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" className="border rounded px-3 py-1" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="bg-fuchsia-600 text-white rounded px-3 py-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
