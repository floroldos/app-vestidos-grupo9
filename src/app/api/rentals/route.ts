import { NextResponse } from "next/server";
import { createRental, isItemAvailable, getItem } from "../../../../lib/RentalManagementSystem";
import { verifyCsrfToken } from "../../../../lib/CsrfSessionManagement";

// Verifica formato yyyy-mm-dd
function normalizeDate(s: string | null) {
  if (!s) return null;
  const m = s.match(/^\d{4}-\d{2}-\d{2}$/);
  return m ? s : null;
}

// Verifica que la fecha exista realmente (no 2025-02-30)
function isRealDate(dateString: string) {
  const d = new Date(dateString);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(dateString);
}

export async function POST(req: Request) {
  const form = await req.formData();

  // --- CSRF ---
  const csrf = form.get("csrf")?.toString() ?? null;
  if (!verifyCsrfToken(csrf)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 400 });
  }

  // --- CAMPOS ---
  const itemId = Number(form.get("itemId") || NaN);
  const name = (form.get("name") || "").toString().trim();
  const email = (form.get("email") || "").toString().trim();
  const phone = (form.get("phone") || "").toString().trim();
  const size = (form.get("size") || "").toString().trim();

  const start = normalizeDate((form.get("start") || "").toString());
  const end = normalizeDate((form.get("end") || "").toString());

  // --- VALIDACIÓN DE CAMPOS VACÍOS ---
  if (!itemId || !name || !email || !phone || !start || !end || !size) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  // --- VALIDACIÓN NOMBRE ---
  const nameRegex = /^[A-Za-zÀ-ÿ\s]{2,40}$/;
  if (!nameRegex.test(name)) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  // --- VALIDACIÓN EMAIL ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // --- VALIDACIÓN TELÉFONO ---
  const phoneRegex = /^[0-9]{7,15}$/;
  if (!phoneRegex.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  // --- VALIDACIÓN FECHAS REALES ---
  if (!isRealDate(start) || !isRealDate(end)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  // --- VALIDAR NO PASADO ---
  const today = new Date().toISOString().split("T")[0];
  if (start < today || end < today) {
    return NextResponse.json({ error: "Dates cannot be in the past" }, { status: 400 });
  }

  // --- VALIDAR ORDEN ---
  if (end < start) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  // --- VALIDAR DURACIÓN <= 7 DÍAS ---
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays > 7) {
    return NextResponse.json(
      { error: "Rental cannot exceed 7 days" },
      { status: 400 }
    );
  }

  // --- VALIDAR ITEM EXISTE ---
  const item = getItem(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // --- VALIDAR DISPONIBILIDAD ---
  if (!isItemAvailable(itemId, start, end)) {
    return NextResponse.json(
      { error: "Item not available for selected dates" },
      { status: 409 }
    );
  }

  // --- CREAR RENTAL ---
  const { error } = createRental({
    itemId,
    start,
    end,
    customer: { name, email, phone },
  });

  if (error) {
    return NextResponse.json({ error }, { status: 409 });
  }

  // Redirect con success
  const res = NextResponse.redirect(new URL(`/items/${itemId}?success=1`, req.url));
  return res;
}
