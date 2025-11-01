import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATH = "/admin";
const SESSION_COOKIE = "gr_admin";

export function middleware(req: NextRequest) {
    const isAdminRoute = req.nextUrl.pathname.startsWith(ADMIN_PATH);
    const session = req.cookies.get(SESSION_COOKIE)?.value;

    if (req.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next();

    // si es admin route y no hay sesión, redirigir
    if (isAdminRoute && !session) {
        const loginUrl = new URL("/admin/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
