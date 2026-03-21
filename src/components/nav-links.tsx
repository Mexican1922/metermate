"use client";

import { ActiveNavLink } from "@/components/active-nav-link";
import { LayoutDashboard, Zap, CreditCard, Shield } from "lucide-react";

export function NavLinks({
  isAdmin,
  variant,
}: {
  isAdmin: boolean;
  variant: "desktop" | "mobile";
}) {
  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/readings", label: "Readings", icon: Zap },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    ...(isAdmin
      ? [{ href: "/dashboard/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <>
      {navLinks.map((link) => (
        <ActiveNavLink
          key={link.href}
          href={link.href}
          label={link.label}
          icon={link.icon}
          variant={variant}
        />
      ))}
    </>
  );
}
