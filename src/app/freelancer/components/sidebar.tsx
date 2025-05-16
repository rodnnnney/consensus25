"use client";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  interface NavBarRoutes {
    name: string;
    path: string;
  }

  const routes: NavBarRoutes[] = [
    { name: "Dashboard", path: "/freelancer" },
    { name: "My Jobs", path: "/freelancer/jobs" },
    { name: "Post Job", path: "/freelancer/post" },
    { name: "Transactions", path: "/freelancer/transactions" },
    { name: "Profile", path: "/freelancer/profile" },
  ];

  return (
    <div className="w-64 m-4 rounded-xl bg-background px-6 py-8 space-y-4 rounded-lg border">
      <div className="flex flex-col h-full justify-between min-h-[calc(100vh-6rem)]">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Navigation</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <button
                key={route.path}
                onClick={() => router.push(route.path)}
                className={`w-full flex items-center py-2 px-3 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground ${
                  pathname === route.path ? "bg-muted" : ""
                }`}
              >
                {route.name}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center py-2 px-3 text-sm font-medium rounded-lg hover:bg-destructive hover:text-destructive-foreground"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 