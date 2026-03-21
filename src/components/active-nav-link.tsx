"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface ActiveNavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  variant?: "desktop" | "mobile";
}

export function ActiveNavLink({
  href,
  label,
  icon: Icon,
  variant = "desktop",
}: ActiveNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        className={`relative flex flex-1 flex-col items-center justify-center py-2.5 text-[11px] font-medium transition-all duration-300 gap-1
          ${
            isActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
      >
        <div
          className={`relative p-1.5 rounded-xl transition-all duration-300 ${
            isActive ? "bg-primary/10" : ""
          }`}
        >
          <Icon className={`h-[18px] w-[18px] transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
          {isActive && (
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          )}
        </div>
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
        ${
          isActive
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
    >
      {label}
    </Link>
  );
}
