import { NextResponse } from "next/server";
import { getItem, getItemRentals } from "../../../../../../lib/RentalManagementSystem";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const item = getItem(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rentals = getItemRentals(id).map((r) => ({ start: r.start, end: r.end }));
  return NextResponse.json({ rentals });
}
