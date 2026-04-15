import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 sm:px-6">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <h1 className="text-xl font-semibold text-black dark:text-white">Shipyard</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-black dark:text-white font-medium hover:opacity-70 transition-opacity"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-90 transition-opacity"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-black dark:text-white leading-tight tracking-tight">
            Your Website Projects,
            <br />
            Delivered & Managed
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Track your website builds in real-time. Get notified when your site goes live.
            Manage retainer subscriptions and maintenance requests—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-90 transition-opacity text-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-lg"
            >
              Sign In to Your Portal
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-24 grid md:grid-cols-3 gap-8 px-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Real-Time Status
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              See exactly where your project is in the build process—from intake to live deployment.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Instant Notifications
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Get notified the moment your site goes live or when there's an update that needs your attention.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Retainer Management
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Track your token budget, submit maintenance requests, and manage your subscription effortlessly.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-6 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p>&copy; 2026 Shipyard. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
