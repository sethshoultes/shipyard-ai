'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const PASSWORD_MIN_LENGTH = 8;

export default function ResetPasswordConfirmPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has a valid reset session
    const checkSession = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
      setSessionLoaded(true);
    };

    checkSession();
  }, []);

  const validatePassword = (): boolean => {
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Set your new password</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="alert"
              className="rounded-lg bg-green-900/20 border border-green-800 p-3 text-sm text-green-400"
            >
              {message}
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-white">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="mt-2 block w-full rounded-lg border border-gray-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="At least 8 characters"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum {PASSWORD_MIN_LENGTH} characters
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="mt-2 block w-full rounded-lg border border-gray-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Repeat your new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          <a href="/" className="text-blue-400 hover:text-blue-300">
            Return to home
          </a>
        </p>
      </div>
    </div>
  );
}
