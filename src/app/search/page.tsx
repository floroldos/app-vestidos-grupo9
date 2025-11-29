import Link from "next/link";
import Image from "next/image";
import DateRangeSelector from "../../components/DateRangeSelector";
import { listItems, type Category, type Item } from "../../../lib/RentalManagementSystem";

type SearchParams = {
  q?: string;
  category?: Category | "";
  size?: string;
  color?: string;
  style?: string;
  start?: string;
  end?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const {
    q = "",
    category = "",
    size = "",
    color = "",
    style = "",
    start = "",
    end = "",
  } = params;

  const items = listItems({
    q,
    category: category || undefined,
    size: size || undefined,
    color: color || undefined,
    style: style || undefined,
    start: start || undefined,
    end: end || undefined,
  });

  const fieldClass =
    "rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all";

  const hasFilters = q || category || size || color || style;

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

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go back to home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* TITLE & SUBTITLE */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Browse catalog</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Explore our curated collection of designer dresses and accessories
          </p>
        </div>

        {/* FILTERS SECTION */}
        <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Filters</h2>
          <form
            method="GET"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
          >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search…"
          className={fieldClass}
        />

        <select
          name="category"
          defaultValue={category}
          className={fieldClass}
          aria-label="category"
        >
          <option value="">All categories</option>
          <option value="dress">Dresses</option>
          <option value="shoes">Shoes</option>
          <option value="bag">Bags</option>
          <option value="jacket">Jackets</option>
        </select>

        <input
          name="size"
          defaultValue={size}
          placeholder="Size"
          className={fieldClass}
        />

        <input
          name="color"
          defaultValue={color}
          placeholder="Color"
          className={fieldClass}
        />

        <input
          name="style"
          defaultValue={style}
          placeholder="Style (e.g., cocktail)"
          className={fieldClass}
        />

        <DateRangeSelector start={start} end={end} />

        <button className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-700 hover:to-rose-700 text-white px-4 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all">
          Search
        </button>
          </form>
        </div>

        {/* RESULTS COUNT */}
        {items.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Found <span className="font-semibold text-slate-900 dark:text-white">{items.length}</span> {items.length === 1 ? "item" : "items"}
              {hasFilters && " matching your filters"}
            </p>
            {hasFilters && (
              <Link
                href="/search"
                className="text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 dark:text-fuchsia-400 dark:hover:text-fuchsia-300 transition-colors"
              >
                Clear filters
              </Link>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it: Item) => (
            <Link
              key={it.id}
              href={`/items/${it.id}`}
              className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-fuchsia-300 dark:hover:border-fuchsia-700"
            >
            {/* Image */}
            <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <Image
                src={it.images[0]}
                alt={it.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  {it.category}
                </span>
              </div>

              {/* Price Badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center rounded-full bg-white/95 dark:bg-slate-800/95 px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-lg">
                  ${it.pricePerDay}/day
                </span>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Hover Button */}
              <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <div className="rounded-xl bg-white dark:bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 dark:text-white shadow-xl">
                  View Details →
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                {it.name}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Available sizes:{" "}
                <span className="font-medium text-slate-900 dark:text-white">
                  {it.sizes.join(", ")}
                </span>
              </p>
            </div>
            </Link>
          ))}
        </div>

        {/* EMPTY STATE */}
        {items.length === 0 && (
          <div className="text-center py-16 sm:py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-fuchsia-100 to-rose-100 dark:from-fuchsia-900/20 dark:to-rose-900/20 mb-6 shadow-lg">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-fuchsia-600 dark:text-fuchsia-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              No dresses found
            </h3>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 px-4 max-w-md mx-auto">
              {hasFilters 
                ? "Try adjusting your filters or search terms to find what you're looking for" 
                : "No items available in the catalog at the moment"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {hasFilters && (
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-700 hover:to-rose-700 text-white px-6 py-3 text-sm font-semibold transition-all shadow-md hover:shadow-xl"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear all filters
                </Link>
              )}
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 px-6 py-3 text-sm font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to homepage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
