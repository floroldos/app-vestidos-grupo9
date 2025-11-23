import { notFound } from "next/navigation";
import Link from "next/link";
import { getItem, getItemRentals } from "../../../../lib/RentalManagementSystem";
import ItemCalendar from "./ItemCalendar";
import { getCsrfToken } from "../../../../lib/CsrfSessionManagement";
import { RentalForm } from "@/components/RentalForm";
import { SuccessBanner } from "./SuccessBanner";
import { ImageGallery } from "@/components/ImageGallery";

export default async function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const item = getItem(id);
  if (!item) return notFound();

  const csrf = await getCsrfToken();
  const booked = await getItemRentals(id);

  const _available = new Set((item.sizes ?? []).map((s: string) => s.toUpperCase()));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-fuchsia-600 hover:text-fuchsia-700 mb-4 sm:mb-6">
        ← Back to home
      </Link>
      <SuccessBanner />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <ImageGallery images={item.images} alt={item.alt} itemName={item.name} />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{item.name}</h1>
          <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400 capitalize">{item.category}</p>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">{item.description}</p>
          <p className="mt-3 sm:mt-4 font-semibold text-base sm:text-lg">From ${item.pricePerDay}/day</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sizes: {item.sizes.join(", ")}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Color: {item.color}
            {item.style ? ` • Style: ${item.style}` : ""}
          </p>

          <div className="mt-6 sm:mt-8">
            <h2 className="font-semibold mb-3 text-base sm:text-lg">Availability</h2>
            <ItemCalendar itemId={id} />
            {booked.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">Dates marked are already booked.</p>
            )}
          </div>

          <div className="mt-8 sm:mt-10">
            <h2 className="font-semibold mb-3 text-base sm:text-lg">Schedule a rental</h2>
            <RentalForm itemId={id} csrf={csrf} availableSizes={item.sizes} />
            <p className="mt-2 text-xs text-slate-500">
              No account required. We will confirm availability via email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
