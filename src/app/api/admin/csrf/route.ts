import { NextResponse } from "next/server";
import { isAdmin, getOrCreateCsrfToken } from "../../../../../lib/CsrfSessionManagement";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const csrf = await getOrCreateCsrfToken();
  return NextResponse.json({ csrf });
}
