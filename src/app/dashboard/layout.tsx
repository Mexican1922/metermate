import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { NavLinks } from "@/components/nav-links";
import { Button } from "@/components/ui/button";
import { MeterMateLogo } from "@/components/logo";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, houses(name, created_by)")
    .eq("user_id", user.id)
    .single();

  if (!tenant) return redirect("/setup");

  const isAdmin = tenant.houses?.created_by === user.id;

  return (
    <div className="flex min-h-screen flex-col bg-background bg-ambient">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="mx-auto max-w-7xl flex h-16 items-center px-4 md:px-6">
          <div className="flex w-full items-center gap-4 md:gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="text-primary animate-pulse-glow rounded-lg">
                <MeterMateLogo size={32} />
              </div>
              <span className="text-lg font-display font-bold tracking-tight gradient-text">
                MeterMate
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-1 ml-6">
              <NavLinks isAdmin={isAdmin} variant="desktop" />
            </nav>

            {/* Right Side */}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[180px] font-mono">
                {user.email}
              </span>
              <form action="/auth/signout" method="post">
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline text-xs">Logout</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden glass rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/30">
        <div className="flex">
          <NavLinks isAdmin={isAdmin} variant="mobile" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-8">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
