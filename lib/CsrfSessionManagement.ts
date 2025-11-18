import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const CSRF_COOKIE = "gr_csrf";
const SESSION_COOKIE = "gr_admin";
const SECRET = process.env.SESSION_SECRET || "default_secret_key";

export async function getOrCreateCsrfToken() {
    const c = await cookies();
    let token = c.get(CSRF_COOKIE)?.value;
    if (!token) {
        token = crypto.randomUUID();
    }
    return token;
}

export async function verifyCsrfToken(formToken: string | null | undefined) {
    if (!formToken) return false;
    const cookieToken = (await cookies()).get(CSRF_COOKIE)?.value;
    return !!cookieToken && cookieToken === formToken;
}

export async function setAdminSession() {
    const token = jwt.sign({ role: "admin" }, SECRET, { expiresIn: "1h" });
    const c = await cookies();
    c.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60,
    });
    return token;
}

export function createAdminToken() {
    return jwt.sign({ role: "admin" }, SECRET, { expiresIn: "1h" });
}

export async function clearAdminSession() {
    const c = await cookies();
    c.set(SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
}

export async function isAdmin() {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return false;

    try {
        const decoded = jwt.verify(token, SECRET) as { role?: string };
        return decoded?.role === "admin";
    } catch {
        return false;
    }
}
