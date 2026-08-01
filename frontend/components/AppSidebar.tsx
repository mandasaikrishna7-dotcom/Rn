"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookUser, Users, ScrollText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home Feed", short: "Home", Icon: Compass },
  { href: "/journey", label: "Journey", short: "Journey", Icon: BookUser },
  { href: "/mentors", label: "Mentors & Experiences", short: "Mentors", Icon: Users },
  { href: "/progress", label: "Progress", short: "Progress", Icon: ScrollText },
  { href: "/settings", label: "Settings", short: "Settings", Icon: Settings },
] as const;

/**
 * Void sidebar (desktop left rail / mobile bottom bar). Nav rows use a
 * single height + padding scale everywhere — the active state is cobalt
 * text + a hard ink left bar, no shape drift between pages.
 */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r-[3px] border-ink bg-void md:flex">
        <div className="flex flex-1 flex-col px-4 py-6">
          <Link href="/" className="mb-8 flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-cobalt shadow-[2px_2px_0_#0a0a0f]">
              <Compass size={20} className="text-white" strokeWidth={2.2} />
            </span>
            <div>
              <p className="font-display text-base leading-tight text-white">THE CURATOR</p>
              <p className="mono-label mt-0.5 text-halftone">Compass journal</p>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-12 items-center gap-3 border-l-4 px-4 text-sm font-medium transition-colors",
                    active
                      ? "border-cobalt bg-cobalt/10 text-white"
                      : "border-transparent text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.Icon size={17} strokeWidth={active ? 2.4 : 2} className={active ? "text-cobalt" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t-2 border-white/10 pt-4">
            <p className="mono-label text-white/45">
              One compass, one reader.
              <br />
              Curation, not attention.
            </p>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t-[3px] border-ink bg-void md:hidden" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                active ? "bg-cobalt/15 text-white" : "text-white/55",
              )}
            >
              <item.Icon size={18} strokeWidth={active ? 2.4 : 2} className={active ? "text-halftone" : ""} />
              {item.short}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
