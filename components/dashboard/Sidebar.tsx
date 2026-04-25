"use client";

import {
  Terminal,
  LayoutDashboard,
  BookOpen,
  LogOut,
  Briefcase,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function Sidebar({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
    { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  ];

  return (
    <>
      <aside className="w-56 border-r  fixed top-0 h-full border-gray-800/60 flex flex-col bg-gray-950 py-6 px-4 shrink-0">
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="p-1.5 bg-emerald-500/10 rounded-md">
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-semibold text-sm text-white">Dev Daily</span>
        </div>

        <nav className="flex-1 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === href
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-800/60 pt-4 mt-4">
          <div className="px-3 mb-3">
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
      <div className="w-56"></div>
    </>
  );
}
