"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrCode, LayoutDashboard, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Generator", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="glass-strong mx-auto flex max-w-6xl items-center justify-between rounded-3xl px-4 py-2.5 sm:px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <QrCode size={18} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            QR<span className="text-gradient">Studio</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <div className="hidden items-center gap-1 rounded-2xl bg-surface-2/50 p-1 sm:flex">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-surface text-ink shadow-soft"
                      : "text-muted hover:text-ink",
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
