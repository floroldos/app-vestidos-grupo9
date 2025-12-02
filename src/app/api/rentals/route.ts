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
  const contentType = req.headers.get("content-type") || "";
  let data: any;

  if (contentType.includes("application/json")) {
    data = await req.json();
  } else if (contentType.includes("multipart/form-data")) {
    try {
      const form = await req.formData();
      data = {
        csrf: form.get("csrf")?.toString() ?? null,
        itemId: form.get("itemId"),
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        size: form.get("size"),
        start: form.get("start"),
        end: form.get("end"),
      };
    } catch {
      // Si falla el parseo de FormData, intentar como URLSearchParams
      const text = await req.text();
      const params = new URLSearchParams(text);
      data = {
        csrf: params.get("csrf"),
        itemId: params.get("itemId"),
        name: params.get("name"),
        email: params.get("email"),
        phone: params.get("phone"),
        size: params.get("size"),
        start: params.get("start"),
        end: params.get("end"),
      };
    }
  } else {
    const text = await req.text();
    const params = new URLSearchParams(text);
    data = {
      csrf: params.get("csrf"),
      itemId: params.get("itemId"),
      name: params.get("name"),
      email: params.get("email"),
      phone: params.get("phone"),
      size: params.get("size"),
      start: params.get("start"),
      end: params.get("end"),
    };
  }

  // --- CSRF ---
  const csrf = data.csrf?.toString() ?? null;
  if (!verifyCsrfToken(csrf)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 400 });
  }

  // --- CAMPOS ---
  const itemId = Number(data.itemId || NaN);
  const name = (data.name || "").toString().trim();
  const email = (data.email || "").toString().trim();
  const phone = (data.phone || "").toString().trim();
  const size = (data.size || "").toString().trim();

  const start = normalizeDate((data.start || "").toString());
  const end = normalizeDate((data.end || "").toString());

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
  const rental = createRental({
    itemId,
    start,
    end,
    customer: { name, email, phone },
  });

  if (rental.error) {
    return NextResponse.json({ error: rental.error }, { status: 409 });
  }

  // Respuesta exitosa con el rental creado
  return NextResponse.json({ success: true, rental: rental.rental }, { status: 201 });
}
