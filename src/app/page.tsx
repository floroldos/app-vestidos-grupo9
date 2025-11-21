"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DatePicker from "react-datepicker";

export default function Home() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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
        <section className="relative overflow-hidden bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
          <div className="absolute top-20 right-0 w-96 h-96 bg-fuchsia-300 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-300 rounded-full blur-3xl opacity-10"></div>
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                Rent designer dresses for every
                <span className="block mt-2 bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-400 bg-clip-text text-transparent">
                  special occasion
                </span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                Look stunning without the commitment. Premium designer dresses with free delivery, professional cleaning, and flexible rental periods.
              </p>

              {/* Quick stats */}
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-4 sm:gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium text-sm">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium text-sm">Pro Cleaning</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium text-sm">1-7 Day Rentals</span>
                </div>
              </div>

              <form action="/search" method="GET" className="mt-8 sm:mt-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 sm:mb-4">Find your perfect dress</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

                <div className="col-span-1 lg:col-span-2">
                  <label htmlFor="query" className="sr-only">Search</label>
                  <input
                    id="query"
                    name="q"
                    type="text"
                    placeholder="Search by style, color, or designer"
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                  />
                </div>

                <div className="w-full">
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Start date"
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100"
                    name="start"
                  />
                </div>

                <div className="w-full">
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="End date"
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100"
                    name="end"
                  />
                </div>

                <div>
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

                  <div className="lg:col-span-5">
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 px-8 py-3.5 text-sm font-semibold text-white hover:from-fuchsia-500 hover:to-rose-500 shadow-lg shadow-fuchsia-600/30 hover:shadow-xl hover:shadow-fuchsia-600/40 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search dresses
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{benefit.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="featured" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold">Featured Collection</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Handpicked designer dresses for your next event</p>
            </div>
            <Link href="/search" className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 transition-colors">
              Browse all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
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
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center rounded-full bg-fuchsia-600/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium shadow-lg">
                      View details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg group-hover:text-fuchsia-600 transition-colors">{item.name}</h3>
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

        <section id="how" className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/60 dark:to-slate-950 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold">How GlamRent Works</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Get dressed in 3 simple steps</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
              {/* Connection lines */}
              <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-fuchsia-200 to-transparent dark:via-fuchsia-900"></div>
              
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="relative"
                >
                  {/* Step number badge */}
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

        {/* Testimonials */}
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
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
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

        {/* CTA Section */}
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


