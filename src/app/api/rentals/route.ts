import { NextResponse } from "next/server";
import {
  createRental,
  isItemAvailable,
  getItem
} from "../../../../lib/RentalManagementSystem";
import { verifyCsrfToken } from "../../../../lib/CsrfSessionManagement";

function normalizeDate(s: string | null) {
  if (!s) return null;

  const d = new Date(s);
  if (isNaN(d.getTime())) return null;

  return d.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  const form = await req.formData();

  const csrf = form.get("csrf")?.toString() ?? null;
  if (!verifyCsrfToken(csrf)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 400 });
  }

  const itemId = Number(form.get("itemId") || NaN);
  const name = (form.get("name") || "").toString().trim();
  const email = (form.get("email") || "").toString().trim();
  const phone = (form.get("phone") || "").toString().trim();

  const phoneRegex = /^[0-9]{7,15}$/;
  if (!phoneRegex.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const start = normalizeDate((form.get("start") || "").toString());
  const end = normalizeDate((form.get("end") || "").toString());

  if (!itemId || !name || !email || !phone || !start || !end) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const item = getItem(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (end < start) {
    return NextResponse.json(
      { error: "End date must be after start date" },
      { status: 400 }
    );
  }

  if (!isItemAvailable(itemId, start, end)) {
    return NextResponse.json(
      { error: "Item not available for selected dates" },
      { status: 409 }
    );
  }

  const { rental, error } = createRental({
    itemId,
    start,
    end,
    customer: { name, email, phone },
  });

  if (error) {
    return NextResponse.json({ error }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

