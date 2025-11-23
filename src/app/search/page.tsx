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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold">Browse catalog</h1>

      {/* FORM */}
      <form
        method="GET"
        className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
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

        <button className="rounded-xl bg-fuchsia-600 text-white px-4 py-2 text-sm hover:bg-fuchsia-500">
          Search
        </button>
      </form>

      {/* Product Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it: Item) => (
          <Link
            key={it.id}
            href={`/items/${it.id}`}
            className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2"
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
        <div className="text-center py-12 sm:py-16">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-fuchsia-100 to-rose-100 dark:from-fuchsia-900/20 dark:to-rose-900/20 mb-4">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 text-fuchsia-600 dark:text-fuchsia-400"
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

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
            No dresses found
          </h3>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 px-4">
            Try adjusting your filters or search terms
          </p>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-700 hover:to-rose-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold transition-all shadow-md hover:shadow-xl"
          >
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  );
}
