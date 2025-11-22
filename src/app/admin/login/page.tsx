import {
  getOrCreateCsrfToken,
  verifyCsrfToken,
  createAdminToken,
} from "../../../../lib/CsrfSessionManagement";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const csrf = await getOrCreateCsrfToken();
  const params = await searchParams;
  const errorMessage = params?.error ?? null;

  async function handleLogin(formData: FormData) {
    "use server";

    const csrfForm = formData.get("csrf")?.toString();
    if (!verifyCsrfToken(csrfForm)) {
      redirect("/admin/login?error=Invalid+CSRF+token");
    }

    const username = formData.get("username")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    const envUser = process.env.ADMIN_USER || "admin";
    const envPass = process.env.ADMIN_PASSWORD || "admin123";

    const validUser = username === envUser;
    const validPass = password === envPass;

    if (!validUser || !validPass) {
      redirect("/admin/login?error=Invalid+credentials");
    }

    const token = createAdminToken();
    const cookieStore = await cookies();

    cookieStore.set({
      name: "gr_admin",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1h
    });

    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Admin sign in</h1>

      {errorMessage && (
        <p className="text-red-600 text-sm mt-4">
          {decodeURIComponent(errorMessage as string)}
        </p>
      )}

      <form action={handleLogin} className="mt-6 grid gap-3 rounded-2xl border p-4">
        <input type="hidden" name="csrf" value={csrf} />

        <input
          name="username"
          placeholder="Username"
          className="rounded-xl border px-4 py-3 text-sm"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="rounded-xl border px-4 py-3 text-sm"
        />

        <button className="rounded-xl bg-fuchsia-600 text-white px-4 py-3 text-sm font-semibold">
          Sign in
        </button>

        <p className="text-xs text-slate-500">
          Protected area. Authorized staff only.
        </p>
      </form>
    </div>
  );
}
