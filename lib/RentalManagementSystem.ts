import 'server-only';
import { initDatabase, getDatabase, seedInitialData, rowToItem, rowToRental } from './database';

export type Category = "dress" | "shoes" | "bag" | "jacket";

export type Item = {
  id: number;
  name: string;
  category: Category;
  pricePerDay: number;
  sizes: string[];
  color: string;
  style?: string;
  description: string;
  images: string[];
  alt: string;
};

export type Rental = {
  id: string;
  itemId: number;
  start: string; // ISO yyyy-mm-dd
  end: string;   // ISO yyyy-mm-dd
  customer: { name: string; email: string; phone: string };
  createdAt: string;
  status: "active" | "canceled";
};

// Datos iniciales que se cargan al iniciar la BD
const initialItems: Item[] = [
  {
    id: 1,
    name: "Silk Evening Gown",
    category: "dress",
    pricePerDay: 79,
    sizes: ["XS", "S", "M", "L"],
    color: "champagne",
    style: "evening",
    description: "Luxurious silk gown with flattering silhouette.",
    images: [
      "/images/dresses/silk-evening-gown.jpg",
      "/images/dresses/silk-evening-gown-2.jpg",
      "/images/dresses/silk-evening-gown-3.jpg",
    ],
    alt: "Model wearing a champagne silk evening gown",
  },
  {
    id: 2,
    name: "Black Tie Dress",
    category: "dress",
    pricePerDay: 99,
    sizes: ["S", "M", "L", "XL"],
    color: "black",
    style: "black-tie",
    description: "Elegant black-tie dress for formal events.",
    images: [
      "/images/dresses/black-tie-dress.jpg",
      "/images/dresses/black-tie-dress-2.jpg",
      "/images/dresses/black-tie-dress-3.jpg",
    ],
    alt: "Elegant black tie dress",
  },
  {
    id: 3,
    name: "Floral Midi Dress",
    category: "dress",
    pricePerDay: 49,
    sizes: ["XS", "S", "M"],
    color: "floral",
    style: "daytime",
    description: "Bright floral midi for daytime events.",
    images: [
      "/images/dresses/floral-midi-dress.jpg",
      "/images/dresses/floral-midi-dress-2.jpg",
      "/images/dresses/floral-midi-dress-3.jpg",
    ],
    alt: "Floral midi dress perfect for daytime events",
  },
  {
    id: 4,
    name: "Velvet Cocktail Dress",
    category: "dress",
    pricePerDay: 59,
    sizes: ["S", "M", "L"],
    color: "burgundy",
    style: "cocktail",
    description: "Rich velvet cocktail dress in deep tones.",
    images: [
      "/images/dresses/velvet-cocktail-dress.jpg",
      "/images/dresses/velvet-cocktail-dress-2.jpg",
      "/images/dresses/velvet-cocktail-dress-3.jpg",
    ],
    alt: "Velvet cocktail dress in deep tones",
  },
];

// Inicializar BD al cargar el módulo
declare global {
  var __dbInitialized: boolean | undefined;
}

function ensureDatabase() {
  if (!globalThis.__dbInitialized) {
    initDatabase();
    seedInitialData(initialItems);
    globalThis.__dbInitialized = true;
  }
}

// -----------------------------
// HELPERS
// -----------------------------

export function hasOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return !(aEnd < bStart || bEnd < aStart);
}

export function getItemRentals(itemId: number) {
  ensureDatabase();
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM rentals WHERE itemId = ? AND status = ?');
  const rows = stmt.all(itemId, 'active') as Record<string, unknown>[];
  console.log(`📅 getItemRentals(${itemId}):`, rows.length, 'rentals activos');
  return rows.map(rowToRental);
}

export function isItemAvailable(itemId: number, start: string, end: string) {
  const rs = getItemRentals(itemId);
  return rs.every((r: Rental) => !hasOverlap(start, end, r.start, r.end));
}

// -----------------------------
// ITEMS
// -----------------------------

export function listItems(filters?: {
  q?: string;
  category?: Category;
  size?: string;
  color?: string;
  style?: string;
  start?: string;
  end?: string;
}) {
  ensureDatabase();
  const db = getDatabase();
  
  let query = 'SELECT * FROM items WHERE 1=1';
  const params: (string | number)[] = [];
  
  if (filters?.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }
  
  if (filters?.color) {
    query += ' AND LOWER(color) = LOWER(?)';
    params.push(filters.color);
  }
  
  if (filters?.style) {
    query += ' AND LOWER(style) = LOWER(?)';
    params.push(filters.style);
  }
  
  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as Record<string, unknown>[];
  let items = rows.map(rowToItem);
  
  // Filtros que necesitan post-procesamiento
  if (filters?.size) {
    items = items.filter((item: Item) => item.sizes.includes(filters.size!));
  }
  
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    items = items.filter((it: Item) => {
      const hay = [it.name, it.color, it.style ?? "", it.category].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }
  
  // Filtro por disponibilidad
  if (filters?.start && filters?.end) {
    items = items.filter((it: Item) => isItemAvailable(it.id, filters.start!, filters.end!));
  }
  
  return items;
}

export function getItem(id: number) {
  ensureDatabase();
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
  const row = stmt.get(id) as Record<string, unknown> | undefined;
  return row ? rowToItem(row) : null;
}

// Alias para compatibilidad
export function getItemById(id: number | string) {
  return getItem(Number(id));
}

export function createRental(data: Omit<Rental, "id" | "createdAt" | "status">) {
  ensureDatabase();
  const ok = isItemAvailable(data.itemId, data.start, data.end);
  if (!ok) return { error: "Item is not available for the selected dates." as const };
  
  const db = getDatabase();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO rentals (id, itemId, start, end, customerName, customerEmail, customerPhone, createdAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    data.itemId,
    data.start,
    data.end,
    data.customer.name,
    data.customer.email,
    data.customer.phone,
    createdAt,
    'active'
  );
  
  const rental: Rental = { ...data, id, createdAt, status: "active" };
  return { rental };
}

export function listRentals() {
  ensureDatabase();
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM rentals ORDER BY createdAt DESC');
  const rows = stmt.all() as Record<string, unknown>[];
  return rows.map(rowToRental);
}

export function cancelRental(id: string) {
  ensureDatabase();
  const db = getDatabase();
  
  const checkStmt = db.prepare('SELECT id FROM rentals WHERE id = ?');
  const exists = checkStmt.get(id) as unknown;
  
  if (!exists) return { error: "Not found" as const };
  
  const updateStmt = db.prepare('UPDATE rentals SET status = ? WHERE id = ?');
  updateStmt.run('canceled', id);
  
  return { ok: true as const };
}

// -----------------------------
// ADMIN FUNCTIONS
// -----------------------------

export function addItem(data: {
  name: string;
  category: Category;
  pricePerDay: number;
  sizes: string[];
  color?: string;
  style?: string;
  description?: string;
  images?: string[];
  alt?: string;
}) {
  ensureDatabase();
  const db = getDatabase();
  
  // Obtener el máximo ID actual
  const maxIdRow = db.prepare('SELECT MAX(id) as maxId FROM items').get() as { maxId: number | null };
  const id = (maxIdRow.maxId || 0) + 1;

  const newItem: Item = {
    id,
    name: data.name,
    category: data.category,
    pricePerDay: data.pricePerDay,
    sizes: data.sizes ?? [],
    color: data.color ?? "unknown",
    style: data.style,
    description: data.description ?? "",
    images: data.images ?? ["/images/placeholder.jpg"],
    alt: data.alt ?? data.name,
  };

  const stmt = db.prepare(`
    INSERT INTO items (id, name, category, pricePerDay, sizes, color, style, description, images, alt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    newItem.id,
    newItem.name,
    newItem.category,
    newItem.pricePerDay,
    JSON.stringify(newItem.sizes),
    newItem.color,
    newItem.style || null,
    newItem.description,
    JSON.stringify(newItem.images),
    newItem.alt
  );

  return newItem;
}

export function updateItem(id: number | string, updates: Partial<Item>) {
  ensureDatabase();
  const db = getDatabase();
  const nid = Number(id);
  
  const existing = getItem(nid);
  if (!existing) return null;
  
  const updated = { ...existing, ...updates, id: nid };
  
  const stmt = db.prepare(`
    UPDATE items 
    SET name = ?, category = ?, pricePerDay = ?, sizes = ?, color = ?, 
        style = ?, description = ?, images = ?, alt = ?
    WHERE id = ?
  `);
  
  stmt.run(
    updated.name,
    updated.category,
    updated.pricePerDay,
    JSON.stringify(updated.sizes),
    updated.color,
    updated.style || null,
    updated.description,
    JSON.stringify(updated.images),
    updated.alt,
    nid
  );
  
  return updated;
}

export function deleteItem(id: number | string) {
  ensureDatabase();
  const db = getDatabase();
  const nid = Number(id);
  
  // Verificar si tiene rentals activos
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM rentals WHERE itemId = ?');
  const result = checkStmt.get(nid) as { count: number } | undefined;
  
  if (result && result.count > 0) {
    throw new Error('Cannot delete item with existing rentals');
  }
  
  const stmt = db.prepare('DELETE FROM items WHERE id = ?');
  const deleteResult = stmt.run(nid);
  
  return deleteResult.changes > 0;
}
