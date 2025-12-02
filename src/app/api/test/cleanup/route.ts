import { NextResponse } from "next/server";
import { clearTestData } from "../../../../../lib/RentalManagementSystem";

export async function POST() {
    // Solo habilitado en ambiente de test
    if (process.env.NODE_ENV !== 'test') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await clearTestData();
    return NextResponse.json({ success: true });
}
