"use client";

import { useState } from "react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      category: "General",
      question: "How does the rental work?",
      answer: "Choose your garment, select the dates, and send the request. We will confirm availability and next steps via email."
    },
    {
      category: "General",
      question: "Is cleaning included?",
      answer: "Yes, cleaning is included with all rentals."
    },
    {
      category: "General",
      question: "How long can I rent?",
      answer: "Between 2 and 7 days. If you need more time, please contact us."
    },
    {
      category: "General",
      question: "Do I need to create an account?",
      answer: "No. Just fill out the form with your details and dates."
    }
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-fuchsia-600 transition-colors mb-6">
            ← Back to home
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-fuchsia-600 to-rose-600 bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Everything you need to know about renting designer dresses with GlamRent
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Quick Links */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                const index = faqs.findIndex(faq => faq.category === category);
                setOpenIndex(index);
                document.getElementById(`faq-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-fuchsia-500 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const isFirstInCategory = index === 0 || faqs[index - 1].category !== faq.category;
            
            return (
              <div key={index} id={`faq-${index}`}>
                {isFirstInCategory && (
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3 flex items-center gap-2">
                    <span className="h-1 w-8 rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-600"></span>
                    {faq.category}
                  </h2>
                )}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-fuchsia-200 dark:hover:border-fuchsia-800 transition-all"
                >
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-600 flex items-center justify-center text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                      <div className="h-px bg-gradient-to-r from-fuchsia-200 to-rose-200 dark:from-fuchsia-900 dark:to-rose-900 mb-4"></div>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 via-rose-600 to-orange-500 p-8 text-center text-white">
          <h3 className="text-xl sm:text-2xl font-bold mb-3">Still have questions?</h3>
          <p className="text-white/90 mb-6 max-w-lg mx-auto">
            Can't find the answer you're looking for? Our friendly team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-fuchsia-600 px-6 py-3 font-semibold hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Contact Support
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
