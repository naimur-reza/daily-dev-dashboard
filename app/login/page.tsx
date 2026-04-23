"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Terminal } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm px-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Terminal className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Dev Daily</h1>
            <p className="text-xs text-gray-500">Your productivity cockpit</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-4">📬</div>
            <h2 className="text-white font-medium mb-2">Check your email</h2>
            <p className="text-gray-400 text-sm">
              We sent a magic link to <span className="text-emerald-400">{email}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@example.com"
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-semibold py-3 rounded-lg text-sm transition-colors"
            >
              {loading ? "Sending..." : "Send magic link →"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-600 mt-8">
          No password needed. Just your email.
        </p>
      </div>
    </div>
  );
}
