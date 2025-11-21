import Link from "next/link";
import Image from "next/image";
import DateRangeSelector from "../../components/DateRangeSelector";
import { listItems, type Category } from "../../../lib/RentalManagementSystem";

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
    "rounded-xl border px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-fuchsia-500";

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

        {/* 🔥 Nuevo DateRangePicker estilado tipo Airbnb */}
        <DateRangeSelector start={start} end={end} />

        <button className="rounded-xl bg-fuchsia-600 text-white px-4 py-2 text-sm hover:bg-fuchsia-500">
          Search
        </button>
      </form>

      {/* RESULTS */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it) => (
          <div
            key={it.id}
            className="rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800">
              <Image
                src={it.images[0]}
                alt={it.alt}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center rounded-full bg-white/85 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-100 shadow-sm">
                  From ${it.pricePerDay}/day
                </span>
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {it.category}
              </p>
              <p className="font-medium">{it.name}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Sizes: {it.sizes.join(", ")}
              </p>

              <div className="mt-3">
                <Link
                  href={`/items/${it.id}`}
                  className="text-sm rounded-lg border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  View details
                </Link>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No items match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
