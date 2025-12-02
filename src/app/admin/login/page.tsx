import {
  getOrCreateCsrfToken,
  verifyCsrfToken,
  setAdminSession,
} from "../../../../lib/CsrfSessionManagement";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const errorMessage = params?.error ?? null;

  async function handleLogin(formData: FormData) {
    "use server";

    const csrfForm = formData.get("csrf")?.toString();

    // Ensure CSRF token exists (Server Actions can modify cookies)
    const serverCsrf = await getOrCreateCsrfToken();

    if (!await verifyCsrfToken(csrfForm)) {
      redirect("/admin/login?error=Invalid+CSRF+token");
    }

    const username = formData.get("username")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    const envUser = process.env.ADMIN_USER || "admin";
    const envPass = process.env.ADMIN_PASS || "admin123";

    const validUser = username === envUser;
    const validPass = password === envPass;

    if (!validUser || !validPass) {
      redirect("/admin/login?error=Invalid+credentials");
    }

    /* const token = createAdminToken(); */
    /*const  cookieStore = await cookies();

    cookieStore.set({
      name: "gr_admin",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1h
    }); */

    await setAdminSession();

    redirect("/admin");
  }

  return <LoginForm handleLogin={handleLogin} errorMessage={errorMessage} />;
}
