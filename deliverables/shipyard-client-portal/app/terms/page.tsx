import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 sm:px-6">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <Link href="/" className="text-xl font-semibold text-black dark:text-white hover:opacity-70 transition-opacity">
            Shipyard
          </Link>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-black dark:text-white font-medium hover:opacity-70 transition-opacity"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-16 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-black dark:text-white">Terms of Service</h1>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-zinc-800 dark:text-zinc-200">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Last Updated: April 15, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Shipyard Client Portal, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to these terms, please do not use this service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">2. Service Description</h2>
              <p>
                Shipyard provides a client portal for tracking website development projects, managing retainer
                subscriptions, and receiving project status updates.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activities that occur under your account. You agree to notify us immediately of any unauthorized
                use of your account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">4. Payment Terms</h2>
              <p>
                All payments are processed securely through Stripe. By submitting payment information, you authorize
                us to charge the agreed-upon fees for projects and retainer subscriptions. All fees are non-refundable
                unless otherwise stated.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">5. Retainer Subscriptions</h2>
              <p>
                Retainer subscriptions renew automatically on a monthly or yearly basis. You may cancel your
                subscription at any time through the Stripe Customer Portal. Cancellations take effect at the end
                of the current billing period.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">6. Service Availability</h2>
              <p>
                We strive to maintain high availability but do not guarantee uninterrupted access to the portal.
                We reserve the right to modify, suspend, or discontinue any part of the service at any time.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">7. Intellectual Property</h2>
              <p>
                All content, features, and functionality of the Shipyard Client Portal are owned by Shipyard and
                are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">8. Limitation of Liability</h2>
              <p>
                Shipyard shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                resulting from your use or inability to use the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material changes
                via email. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">10. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at legal@shipyard.ai
              </p>
            </section>
          </div>

          <div className="pt-8">
            <Link
              href="/"
              className="text-black dark:text-white hover:opacity-70 transition-opacity font-medium"
            >
              ← Back to Home
            </Link>
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
