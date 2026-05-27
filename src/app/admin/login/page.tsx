"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid password");
      }

      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl uppercase tracking-tight text-white">
            SD <span className="text-teal">Admin</span>
          </h1>
          <p className="text-white/50 mt-2">Enter password to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AdminInput
            type="password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter admin password"
            required
            autoFocus
          />

          {error && (
            <div className="bg-pink/10 border border-pink/20 rounded-lg p-3 text-pink text-sm">
              {error}
            </div>
          )}

          <AdminButton type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </AdminButton>
        </form>

        {/* Back to site */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            &larr; Back to site
          </a>
        </div>
      </div>
    </div>
  );
}
