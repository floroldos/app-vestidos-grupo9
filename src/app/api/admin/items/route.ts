import { NextResponse } from "next/server";
import { isAdmin, verifyCsrfToken } from "../../../../../lib/CsrfSessionManagement";  
import { listItems, addItem } from "../../../../../lib/RentalManagementSystem";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = listItems();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const csrf = data.csrf;
  if (!(await verifyCsrfToken(csrf))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const name = (data.name || "").toString().trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const category = (data.category || "dress").toString() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sizes = Array.isArray(data.sizes) ? data.sizes : (data.sizes || []).map?.((s: any) => s.toString()) ?? [];
  const pricePerDay = Number(data.pricePerDay) || 0;

  if (!name || !category || !pricePerDay) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const item = addItem({ name, category, sizes, pricePerDay, color: data.color, style: data.style, description: data.description, images: data.images, alt: data.alt });

  return NextResponse.json({ item }, { status: 201 });
}
