export default function FAQPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h1>
      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6">
          <h2 className="font-semibold text-lg">How does the rental work?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            Choose your garment, select the dates, and send the request. We will confirm availability and next steps via email.
          </p>
        </div>

        <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6">
          <h2 className="font-semibold text-lg">Is cleaning included?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            Yes, cleaning is included with all rentals.
          </p>
        </div>

        <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6">
          <h2 className="font-semibold text-lg">How long can I rent?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            Between 2 and 7 days. If you need more time, please contact us.
          </p>
        </div>

        <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6">
          <h2 className="font-semibold text-lg">Do I need to create an account?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            No. Just fill out the form with your details and dates.
          </p>
        </div>
      </div>
    </div>
  );
}
