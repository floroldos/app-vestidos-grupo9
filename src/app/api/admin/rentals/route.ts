import { NextResponse } from "next/server";
import { isAdmin } from "../../../../../lib/CsrfSessionManagement";
import { listRentals } from "../../../../../lib/RentalManagementSystem";

export function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ rentals: listRentals() });
}
