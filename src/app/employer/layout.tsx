"use client";

import { useRouter } from "next/navigation";
import { Sidebar } from "./components/sidebar";
import { createClient } from "@/lib/supabase/client";

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-shrink-0">
        <Sidebar onLogout={handleLogout} />
      </div>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
