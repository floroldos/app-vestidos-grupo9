import { isAdmin, getOrCreateCsrfToken } from "../../../lib/CsrfSessionManagement";
import { listItems } from "../../../lib/RentalManagementSystem";
import { redirect } from "next/navigation";
import AdminRentals from "./AdminRentals"; // Client Component

type AdminItem = {
  id: number | string;
  name: string;
  category: string;
  sizes: string[];
  pricePerDay: number;
};

export default async function Page() {
  const admin = await isAdmin();
  if (!admin) redirect("/admin/login");

  const csrf = await getOrCreateCsrfToken();
  const items = listItems();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <form action="/api/admin/logout" method="POST">
          <button className="text-sm rounded-lg border px-3 py-2">Sign out</button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="font-semibold">Inventory</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Add/edit/delete can be wired to a database later.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Sizes</th>
                <th className="py-2 pr-4">Price/day</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i: AdminItem) => (
                <tr key={i.id} className="border-t">
                  <td className="py-2 pr-4">{i.id}</td>
                  <td className="py-2 pr-4">{i.name}</td>
                  <td className="py-2 pr-4">{i.category}</td>
                  <td className="py-2 pr-4">{i.sizes.join(", ")}</td>
                  <td className="py-2 pr-4">${i.pricePerDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">Scheduled rentals</h2>
        <AdminRentals csrf={csrf} />
      </section>
    </div>
  );
}
