"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 sm:px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-black dark:text-white">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-90 transition-opacity"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 max-w-3xl mx-auto w-full">
        <div className="space-y-6">
          <div>
            <p className="text-zinc-600 dark:text-zinc-400">Logged in as:</p>
            <p className="text-lg font-medium text-black dark:text-white">{user?.email}</p>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Your Projects
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Projects will appear here when you submit a project intake and complete payment.
            </p>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Getting Started
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Welcome to your Shipyard client portal. Here you can track your projects, manage your
              retainer subscription, and stay updated on your website builds.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Session expires after 7 days of inactivity.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
