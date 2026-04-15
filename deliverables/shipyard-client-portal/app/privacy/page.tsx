import Link from "next/link";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-black dark:text-white">Privacy Policy</h1>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-zinc-800 dark:text-zinc-200">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Last Updated: April 15, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (email address, password)</li>
                <li>Project details (project name, description, requirements)</li>
                <li>Payment information (processed securely by Stripe)</li>
                <li>Usage data (login times, pages visited, features used)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your project requests and payments</li>
                <li>Send you project status updates and notifications</li>
                <li>Respond to your comments and questions</li>
                <li>Detect and prevent fraud and abuse</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">3. Information Sharing</h2>
              <p>
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Service providers who assist in our operations (Supabase, Stripe, Resend)</li>
                <li>Law enforcement when required by law</li>
                <li>Other parties with your consent</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">4. Data Security</h2>
              <p>
                We take reasonable measures to protect your information from unauthorized access, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Secure password storage (hashed with bcrypt)</li>
                <li>Secure session management (httpOnly cookies)</li>
                <li>Regular security audits and updates</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">5. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to maintain your session and improve your experience.
                You can control cookies through your browser settings, but disabling them may affect functionality.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">6. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide services.
                You may request deletion of your account and data by contacting us at privacy@shipyard.ai
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">7. Your Rights</h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">8. Third-Party Services</h2>
              <p>
                Our service integrates with third-party providers:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Supabase:</strong> Database and authentication</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Resend:</strong> Email delivery</li>
                <li><strong>Vercel:</strong> Hosting infrastructure</li>
              </ul>
              <p>
                These providers have their own privacy policies governing the use of your information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence.
                We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">10. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal
                information from children under 13.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">11. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any material changes by
                posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-black dark:text-white">12. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="font-medium">
                privacy@shipyard.ai
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
