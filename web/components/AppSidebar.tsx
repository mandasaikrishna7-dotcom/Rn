"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookUser, StickyNote, Users, ScrollText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home feed", short: "Home", Icon: Compass },
  { href: "/journey", label: "Journey", short: "Journey", Icon: BookUser },
  { href: "/notes", label: "Notes", short: "Notes", Icon: StickyNote },
  { href: "/mentors", label: "Mentors and experiences", short: "Mentors", Icon: Users },
  { href: "/progress", label: "Progress", short: "Progress", Icon: ScrollText },
  { href: "/settings", label: "Settings", short: "Settings", Icon: Settings },
] as const;

/**
 * Minimalist sidebar (desktop left rail / mobile bottom bar).
 */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-neutral-200 bg-white md:flex">
        <div className="flex flex-1 flex-col px-4 py-6">
          <Link href="/" className="mb-8 flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-xs">
              <Compass size={18} className="text-white" strokeWidth={2} />
            </span>
            <div>
              <p className="text-base font-semibold leading-tight text-neutral-900 tracking-[-0.02em]">NextSelf</p>
              <p className="text-[12px] font-normal text-neutral-500 mt-0.5">Growth compass</p>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col space-y-1" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                    active
                      ? "bg-neutral-100 font-medium text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                  )}
                >
                  <item.Icon size={17} strokeWidth={1.8} className={active ? "text-neutral-900" : "text-neutral-400"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-neutral-100 pt-4">
            <p className="mono-label text-[10px] text-neutral-400 leading-relaxed">
              One compass, one reader.
              <br />
              Curation, not attention.
            </p>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-200 bg-white/90 backdrop-blur-md md:hidden" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                active ? "bg-neutral-100 text-neutral-900" : "text-neutral-400 hover:text-neutral-800",
              )}
            >
              <item.Icon size={18} strokeWidth={1.8} className={active ? "text-neutral-900" : "text-neutral-400"} />
              {item.short}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
