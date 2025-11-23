"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DateRangeSelectorHome from "../components/DateRangeSelectorHome";

export default function Home() {
  const featured = [
    { id: 1, name: "Silk Evening Gown", price: 79, image: "/images/dresses/silk-evening-gown.jpg", alt: "Model wearing a champagne silk evening gown", category: "Evening" },
    { id: 2, name: "Black Tie Dress", price: 99, image: "/images/dresses/black-tie-dress.jpg", alt: "Elegant black tie dress", category: "Formal" },
    { id: 3, name: "Floral Midi Dress", price: 49, image: `/images/dresses/floral-midi-dress.jpg`, alt: "Floral midi dress perfect for daytime events", category: "Casual" },
    { id: 4, name: "Velvet Cocktail Dress", price: 59, image: "/images/dresses/velvet-cocktail-dress.jpg", alt: "Velvet cocktail dress in deep tones", category: "Cocktail" },
  ];

  const steps = [
    { emoji: "🔍", title: "Browse", text: "Explore our curated collection of designer dresses for every occasion.", icon: "search" },
    { emoji: "📅", title: "Reserve", text: "Select your dates and size. We'll deliver it to your door for free.", icon: "calendar" },
    { emoji: "✨", title: "Enjoy & Return", text: "Look amazing, make memories. Return it hassle-free with prepaid shipping.", icon: "sparkles" },
  ];

  const benefits = [
    { icon: "💎", title: "Designer Quality", text: "Premium brands at a fraction of retail price" },
    { icon: "🚚", title: "Free Delivery", text: "Fast shipping both ways, always included" },
    { icon: "🧼", title: "Pro Cleaning", text: "We handle all cleaning, so you don't have to" },
    { icon: "💰", title: "Save Money", text: "Rent for 10-20% of retail cost" },
  ];

  const testimonials = [
    { name: "Sarah M.", text: "Perfect for my sister's wedding! Saved $500 and looked incredible.", rating: 5 },
    { name: "Emily R.", text: "The quality exceeded my expectations. Will definitely rent again!", rating: 5 },
    { name: "Jessica L.", text: "So convenient and affordable. Love this service!", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-fuchsia-600 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-shadow">
              GR
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-fuchsia-600 to-rose-500 bg-clip-text text-transparent">
              GlamRent
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            <Link href="/search" className="hover:text-fuchsia-600 transition-colors">Browse</Link>
            <Link href="#how" className="hover:text-fuchsia-600 transition-colors">How it works</Link>
            <Link href="#featured" className="hover:text-fuchsia-600 transition-colors">Featured</Link>
            <Link href="/faq" className="hover:text-fuchsia-600 transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/admin/login" className="text-sm hover:text-fuchsia-600 transition-colors hidden sm:inline-block">Admin</Link>
            <Link href="/search" className="md:hidden rounded-lg bg-gradient-to-r from-fuchsia-600 to-rose-600 px-3 py-1.5 text-sm font-medium text-white">Browse</Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="max-w-5xl">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                Rent designer dresses for every
                <span className="block mt-2 bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-400 bg-clip-text text-transparent">
                  special occasion
                </span>
              </h1>

              <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                Look stunning without the commitment. Premium designer dresses with free delivery, professional cleaning, and flexible rental periods.
              </p>

              {/* FILTER BAR */}
              <form
                action="/search"
                method="GET"
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm"
              >
                {/* Search bar */}
                <div className="col-span-2 sm:col-span-2 lg:col-span-2">
                  <label htmlFor="query" className="sr-only">Search</label>
                  <input
                    id="query"
                    name="q"
                    type="text"
                    placeholder="Search by style, color, or designer"
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                  />
                </div>

                {/* Dates */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                  <DateRangeSelectorHome />
                </div>

                {/* Size */}
                <div className="col-span-2 sm:col-span-2 lg:col-span-1">
                  <label htmlFor="size" className="sr-only">Size</label>
                  <select
                    id="size"
                    name="size"
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                  >
                    <option value="">Any size</option>
                    <option>XS</option>
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-5">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-fuchsia-600 px-6 py-3 text-sm font-semibold text-white hover:bg-fuchsia-500"
                  >
                    Search dresses
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <section id="featured" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Featured picks</h2>
            <Link href="/search" className="text-sm text-fuchsia-600 hover:underline">Browse all →</Link>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 transition-all hover:-translate-y-1"
              >
                <div className="aspect-[3/4] relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={item.id === 1}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 shadow-lg backdrop-blur-sm">
                      From ${item.price}/day
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-lg group-hover:text-fuchsia-600 transition-colors">
                    {item.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Free cleaning
                    </span>

                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      1-7 days
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="bg-slate-50/70 dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">How it works</h2>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <div key={i} className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-600 to-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-lg z-10">
                    {i + 1}
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 transition-all hover:-translate-y-1 pt-10">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-fuchsia-600/10 to-rose-600/10 dark:from-fuchsia-600/20 dark:to-rose-600/20 flex items-center justify-center text-4xl mb-6">
                      {s.emoji}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-white dark:bg-slate-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">What Our Customers Say</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Join hundreds of happy renters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mb-4">"{testimonial.text}"</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">— {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-fuchsia-600 via-rose-600 to-orange-500 text-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Ready to Look Amazing?</h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Browse our collection of designer dresses and find the perfect outfit for your special occasion.
            </p>

            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-fuchsia-600 px-8 py-4 text-lg font-semibold hover:bg-slate-50 shadow-2xl hover:shadow-white/20 transition-all hover:scale-105"
            >
              Start Browsing
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
