"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useThemeStore } from "@/stores/theme-store";

const publicRoutes = ["/login", "/register"];

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const theme = useThemeStore((state) => state.theme);
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return <>{children}</>;
  }

  if (pathname === "/home") {
    return <div className={`${theme === "light" ? "theme-light" : ""} min-h-screen bg-ink text-white`}><main>{children}</main><Sidebar variant="home" /></div>;
  }

  return <div className={`${theme === "light" ? "theme-light" : ""} app-shell min-h-screen bg-ink text-white`}><div className="min-h-screen"><Topbar /><main className="app-content mx-auto max-w-[1440px] p-5 lg:p-8">{children}</main><Sidebar variant="home" /></div></div>;
}
