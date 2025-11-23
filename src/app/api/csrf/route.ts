import { NextResponse } from "next/server";
import { getOrCreateCsrfToken } from "../../../../lib/CsrfSessionManagement";

export async function GET() {
    const token = await getOrCreateCsrfToken();
    return NextResponse.json({ csrf: token });
}
