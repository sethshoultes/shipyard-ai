"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  validateSignupForm,
  type SignupFormErrors,
} from "@/lib/validation/auth";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});

    // Validate form
    const validation = validateSignupForm(email, password, passwordConfirm);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      // Sign up user via Supabase Auth
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signupError) {
        // Handle specific Supabase Auth errors
        if (
          signupError.message.toLowerCase().includes("already registered")
        ) {
          setGeneralError(
            "This email is already registered. Please log in instead."
          );
        } else if (signupError.message.toLowerCase().includes("password")) {
          setGeneralError(
            "Password does not meet security requirements. Please try a different password."
          );
        } else {
          setGeneralError(signupError.message || "An error occurred during signup.");
        }
        return;
      }

      if (!data.user) {
        setGeneralError("Signup failed. Please try again.");
        return;
      }

      // Create client record in clients table
      const { error: clientError } = await supabase
        .from("clients")
        .insert({
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (clientError) {
        console.error("Error creating client record:", clientError);
        // Don't fail signup if client record creation fails, but log it
        // The user is already signed up in Supabase Auth
      }

      // Auto-login (Supabase automatically creates a session on signup)
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setGeneralError(
        "Network error occurred. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-gray-400 text-sm">
          Sign up to start managing your projects
        </p>
      </div>

      {generalError && (
        <div
          role="alert"
          className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-sm text-red-400"
        >
          {generalError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className={`mt-2 block w-full rounded-lg border px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition ${
            errors.email
              ? "border-red-600 bg-red-900/10 focus:ring-red-500"
              : "border-gray-600 bg-slate-800 focus:ring-blue-500"
          }`}
          placeholder="you@example.com"
          required
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-white"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={`mt-2 block w-full rounded-lg border px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition ${
            errors.password
              ? "border-red-600 bg-red-900/10 focus:ring-red-500"
              : "border-gray-600 bg-slate-800 focus:ring-blue-500"
          }`}
          placeholder="Minimum 8 characters"
          required
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">{errors.password}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="passwordConfirm"
          className="block text-sm font-medium text-white"
        >
          Confirm password
        </label>
        <input
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          disabled={loading}
          className={`mt-2 block w-full rounded-lg border px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition ${
            errors.passwordConfirm
              ? "border-red-600 bg-red-900/10 focus:ring-red-500"
              : "border-gray-600 bg-slate-800 focus:ring-blue-500"
          }`}
          placeholder="Confirm your password"
          required
        />
        {errors.passwordConfirm && (
          <p className="mt-1 text-sm text-red-400">{errors.passwordConfirm}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <a href="/login" className="text-blue-400 hover:text-blue-300">
          Log in
        </a>
      </p>
    </form>
  );
}
