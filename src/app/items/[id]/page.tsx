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
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-fuchsia-600 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-shadow">
              GR
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-fuchsia-600 to-rose-500 bg-clip-text text-transparent">
              GlamRent
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hidden sm:flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse catalog
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <SuccessBanner />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* IMAGE GALLERY */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ImageGallery images={item.images} alt={item.alt} itemName={item.name} />
          </div>

          {/* PRODUCT DETAILS */}
          <div>
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                  {item.category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">{item.name}</h1>
            </div>

            {/* Price Card */}
            <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-rose-500 bg-clip-text text-transparent">
                  ${item.pricePerDay}
                </span>
                <span className="text-slate-600 dark:text-slate-400">/day</span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">Starting price for rental</p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-300 dark:text-slate-300 mb-2 tracking-wide">Description</h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
            </div>

            {/* Product Details */}
            <div className="mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Available Sizes</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.sizes.join(", ")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Color & Style</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                    {item.color}{item.style ? ` • ${item.style}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="font-bold text-lg">Availability Calendar</h2>
              </div>
              <ItemCalendar itemId={id} />
              {booked.length > 0 && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Dates marked in red are already booked.
                </p>
              )}
            </div>

            {/* Rental Form Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="font-bold text-lg">Schedule a Rental</h2>
              </div>
              <RentalForm itemId={id} csrf={csrf} availableSizes={item.sizes} />
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-fuchsia-600 dark:text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>No account required. We will confirm availability and next steps via email.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
