export default function ContactPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

            <div className="prose dark:prose-invert mb-8">
                <p>
                    Have questions about our rental service? We're here to help! Fill out the form below
                    and we'll get back to you as soon as possible.
                </p>
            </div>

            <form className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Full name
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-fuchsia-500 focus:ring-fuchsia-500"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-fuchsia-500 focus:ring-fuchsia-500"
                    />
                </div>

                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Subject
                    </label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        required
                        className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-fuchsia-500 focus:ring-fuchsia-500"
                    />
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Message
                    </label>
                    <textarea
                        name="message"
                        id="message"
                        rows={4}
                        required
                        className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-fuchsia-500 focus:ring-fuchsia-500"
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto rounded-xl bg-fuchsia-600 px-6 py-3 text-sm font-semibold text-white hover:bg-fuchsia-500"
                    >
                        Send message
                    </button>
                </div>
            </form>

            <div className="mt-12 prose dark:prose-invert">
                <h2>Other Ways to Reach Us</h2>
                <div className="mt-6 space-y-4">
                    <p>
                        <strong>Email:</strong> support@glamrent.com
                    </p>
                    <p>
                        <strong>Phone:</strong> (555) 123-4567
                    </p>
                    <p>
                        <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
                    </p>
                </div>
            </div>
        </div>
    );
}