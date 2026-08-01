"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBootstrap } from "@/hooks/useApi";

/**
 * Single-user session guard: until onboarding is complete, the only
 * reachable route is /onboarding. No auth system exists — this is the
 * product's "seed profile" gate.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useBootstrap();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const onboarded = Boolean(data?.onboarded);
    if (!onboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [isLoading, data, pathname, router]);

  return <>{children}</>;
}
