"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Award, QrCode, Link2, LayoutDashboard, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "QR Generator", icon: QrCode },
  { href: "/shorten", label: "Short Links", icon: Link2 },
  { href: "/certificate-generator", label: "Certificates", icon: Award },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <Link
        href="/"
        onClick={onNavigate}
        className="mb-4 flex items-center gap-2.5 px-2 py-2"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
          <QrCode size={18} />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">
          QR<span className="text-gradient">Studio</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-brand/10 text-ink shadow-soft"
                  : "text-muted hover:bg-surface-2/60 hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-xl transition-colors",
                  active
                    ? "bg-brand-gradient text-white"
                    : "bg-surface-2/60 text-muted group-hover:text-ink",
                )}
              >
                <Icon size={16} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center justify-between rounded-2xl border border-line bg-surface-2/40 p-2">
        <span className="px-2 text-xs text-muted">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-line bg-surface/70 backdrop-blur-xl lg:block">
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-[264px] border-r border-line bg-surface shadow-glass lg:hidden"
            >
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="btn-icon absolute right-3 top-3 h-9 w-9"
              >
                <X size={18} />
              </button>
              <NavContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
