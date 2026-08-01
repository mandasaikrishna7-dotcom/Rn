"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { FocusBanner } from "@/components/FocusBanner";

/**
 * App shell: void sidebar + comic focus banner. The banner sits at the
 * very top and content follows immediately — no empty hero region.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div className="flex min-h-screen flex-col md:pl-60">
        <FocusBanner />
        <main className="page-turn mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-24 md:px-8 md:pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}
