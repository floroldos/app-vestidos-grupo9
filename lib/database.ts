import 'server-only';
import type { Item, Rental } from './RentalManagementSystem';

// Importación dinámica solo en servidor
let Database: any = null;

// Usar globalThis para persistir la BD entre HMR en desarrollo
declare global {
    var __db: any | undefined;
}

export function initDatabase() {
    // Solo ejecutar en servidor
    if (typeof window !== 'undefined') {
        throw new Error('Database can only be initialized on the server');
    }

    if (globalThis.__db) return globalThis.__db;

    // Cargar better-sqlite3 dinámicamente
    if (!Database) {
        Database = require('better-sqlite3');
    }

    // Crear BD en memoria
    globalThis.__db = new Database(':memory:');

    // Crear tablas
    globalThis.__db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      pricePerDay INTEGER NOT NULL,
      sizes TEXT NOT NULL,
      color TEXT NOT NULL,
      style TEXT,
      description TEXT NOT NULL,
      images TEXT NOT NULL,
      alt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rentals (
      id TEXT PRIMARY KEY,
      itemId INTEGER NOT NULL,
      start TEXT NOT NULL,
      end TEXT NOT NULL,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      FOREIGN KEY (itemId) REFERENCES items(id)
    );

    CREATE INDEX IF NOT EXISTS idx_rentals_itemId ON rentals(itemId);
    CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
  `);

    console.log('✅ Base de datos en memoria inicializada');

    return globalThis.__db;
}

export function getDatabase() {
    if (!globalThis.__db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return globalThis.__db;
}

// Seed inicial con los items del JSON
export function seedInitialData(items: Item[]) {
    const database = getDatabase();

    // Verificar si ya hay datos
    const count = database.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number };
    if (count.count > 0) {
        console.log(`ℹ️  BD ya tiene ${count.count} items, saltando seed`);
        return;
    }

    const insertItem = database.prepare(`
    INSERT INTO items (id, name, category, pricePerDay, sizes, color, style, description, images, alt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const insertMany = database.transaction((items: Item[]) => {
        for (const item of items) {
            insertItem.run(
                item.id,
                item.name,
                item.category,
                item.pricePerDay,
                JSON.stringify(item.sizes),
                item.color,
                item.style || null,
                item.description,
                JSON.stringify(item.images),
                item.alt
            );
        }
    });

    insertMany(items);
    console.log(`✅ ${items.length} items cargados en la BD`);
}

// Helper para convertir row de BD a Item
export function rowToItem(row: any): Item {
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        pricePerDay: row.pricePerDay,
        sizes: JSON.parse(row.sizes),
        color: row.color,
        style: row.style,
        description: row.description,
        images: JSON.parse(row.images),
        alt: row.alt,
    };
}

// Helper para convertir row de BD a Rental
export function rowToRental(row: any): Rental {
    return {
        id: row.id,
        itemId: row.itemId,
        start: row.start,
        end: row.end,
        customer: {
            name: row.customerName,
            email: row.customerEmail,
            phone: row.customerPhone,
        },
        createdAt: row.createdAt,
        status: row.status,
    };
}
