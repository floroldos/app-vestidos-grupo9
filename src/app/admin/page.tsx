import { isAdmin, getOrCreateCsrfToken } from "../../../lib/CsrfSessionManagement";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

export default async function Page() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
  const csrf = await getOrCreateCsrfToken();

  return <AdminDashboard csrf={csrf} />;
}
