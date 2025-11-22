import Link from 'next/link';

export function Footer() {
    return (
        <footer className="mt-auto py-6 sm:py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        © {new Date().getFullYear()} GlamRent. All rights reserved.
                    </p>
                    <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
                        <Link href="/terms" className="text-sm text-slate-700 hover:text-fuchsia-600 dark:text-slate-300 dark:hover:text-fuchsia-400 transition-colors">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-sm text-slate-700 hover:text-fuchsia-600 dark:text-slate-300 dark:hover:text-fuchsia-400 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/contact" className="text-sm text-slate-700 hover:text-fuchsia-600 dark:text-slate-300 dark:hover:text-fuchsia-400 transition-colors">
                            Contact
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}