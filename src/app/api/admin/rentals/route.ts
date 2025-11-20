import { NextResponse } from "next/server";
import { isAdmin } from "../../../../../lib/CsrfSessionManagement";
import { listRentals } from "../../../../../lib/RentalManagementSystem";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";

  const admin = await isAdmin(cookieHeader);

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ rentals: listRentals() });
}
