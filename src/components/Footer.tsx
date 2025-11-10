import Link from 'next/link';

export function Footer() {
    return (
        <footer className="mt-auto py-8 border-t">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        © {new Date().getFullYear()} GlamRent. All rights reserved.
                    </p>
                    <nav className="flex gap-6">
                        <Link href="/terms" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                            Privacy
                        </Link>
                        <Link href="/contact" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                            Contact
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}