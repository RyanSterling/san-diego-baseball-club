"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TeamFundLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      router.push("/team-fund");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white/5 border border-white/10 p-8">
          <h1 className="font-headline text-2xl uppercase tracking-tight text-white text-center mb-2">
            Team <span className="text-teal">Fund</span>
          </h1>
          <p className="text-white/50 text-center mb-6">Enter the team password to access</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 bg-pink/10 border border-pink/20 p-3 text-pink text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-colors text-center text-lg"
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-teal text-dark py-3 px-4 rounded-lg font-headline uppercase tracking-wide hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
