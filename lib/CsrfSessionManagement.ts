import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const CSRF_COOKIE = "gr_csrf";
const SESSION_COOKIE = "gr_admin";

// Validar que SESSION_SECRET esté definido
if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required for security");
}

const SECRET: string = process.env.SESSION_SECRET;

// Solo leer el token (para Server Components que no pueden modificar cookies)
export async function getCsrfToken() {
    const c = await cookies();
    return c.get(CSRF_COOKIE)?.value || "";
}

// Crear o obtener token (solo para Route Handlers y Server Actions)
export async function getOrCreateCsrfToken() {
    const c = await cookies();
    let token = c.get(CSRF_COOKIE)?.value;
    if (!token) {
        token = crypto.randomUUID();
        c.set(CSRF_COOKIE, token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24, // 24 horas
        });
    }
    return token;
}

export async function verifyCsrfToken(formToken: string | null | undefined) {
    if (!formToken) return false;
    const cookieToken = (await cookies()).get(CSRF_COOKIE)?.value;
    return !!cookieToken && cookieToken === formToken;
}

export async function setCsrfToken(providedToken?: string) {
    const c = await cookies();
    const token = providedToken ?? crypto.randomUUID();
    c.set(CSRF_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60,
    });
    return token;
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
    c.set(CSRF_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });

}

export async function isAdmin(rawCookieHeader?: string) {
    let token: string | undefined;

    if (rawCookieHeader) {
        // Cuando viene desde GET/POST de un API route
        const cookiesArray = rawCookieHeader.split(";").map((c) => c.trim());
        const session = cookiesArray.find((c) =>
            c.startsWith(`${SESSION_COOKIE}=`)
        );
        token = session?.split("=")[1];
    } else {
        // Cuando viene desde Server Components
        token = (await cookies()).get(SESSION_COOKIE)?.value;
    }

    if (!token) return false;

    try {
        const decoded = jwt.verify(token, SECRET) as { role?: string };
        return decoded.role === "admin";
    } catch {
        return false;
    }
}
