import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar user={user} />
      {/* On mobile, Sidebar renders a fixed top bar + spacer div (h-14).
          The main content sits below that naturally. */}
      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
