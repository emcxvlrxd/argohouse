"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { t } from "@/lib/i18n";
import { Shield, Menu, Crosshair } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role;
      if (role !== "admin" && role !== "owner") {
        redirect("/dashboard");
      }
    }
  }, [session]);

  if (!session) {
    redirect("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-aurora pointer-events-none opacity-30" />

      <div className="flex">
        <AdminSidebar />

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 z-50 h-full w-64 bg-black/90 backdrop-blur-2xl border-r border-white/10 lg:hidden">
              <AdminSidebar />
            </div>
          </>
        )}

        <div className="flex-1 min-h-screen lg:pl-64">
          <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-2xl border-b border-white/10">
            <div className="flex items-center justify-between px-4 lg:px-6 h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-bold">{t("Admin Panel")}</h2>
              </div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <Crosshair className="w-4 h-4 mr-1" />
                  {t("Back to Site")}
                </Button>
              </Link>
            </div>
          </header>
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
