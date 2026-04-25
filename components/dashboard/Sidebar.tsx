"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  LayoutDashboard,
  BookOpen,
  LogOut,
  Briefcase,
  BrainCircuit,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/planner", label: "Planner", icon: BrainCircuit },
];

export default function Sidebar({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const NavLinks = () => (
    <nav className="flex-1 space-y-1">
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            pathname === href
              ? "bg-emerald-500/10 text-emerald-400"
              : "text-gray-400 hover:text-white hover:bg-gray-800/60"
          }`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );

  const UserFooter = () => (
    <div className="border-t border-gray-800/60 pt-4 mt-4">
      <div className="px-3 mb-3">
        <p className="text-xs text-gray-500 truncate">
          {user.email ?? "Anonymous"}
        </p>
      </div>
      <button
        onClick={signOut}
        className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP: fixed sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-56 border-r border-gray-800/60 bg-gray-950 z-30 py-6 px-4">
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="p-1.5 bg-emerald-500/10 rounded-md">
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-semibold text-sm text-white">Dev Daily</span>
        </div>
        <NavLinks />
        <UserFooter />
      </aside>

      {/* Desktop content offset */}
      <div className="hidden lg:block w-56 shrink-0" />

      {/* ── MOBILE: fixed top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-gray-950 border-b border-gray-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500/10 rounded-md">
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-semibold text-sm text-white">Dev Daily</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile content offset */}
      <div className="lg:hidden h-14 shrink-0" />

      {/* ── MOBILE: backdrop ── */}
      <div
        onClick={() => setOpen(false)}
        className={`lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── MOBILE: drawer ── */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-screen w-64 z-50 bg-gray-950 border-r border-gray-800/60 shadow-2xl flex flex-col py-6 px-4 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/10 rounded-md">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-semibold text-sm text-white">Dev Daily</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <NavLinks />
        <UserFooter />
      </div>
    </>
  );
}
