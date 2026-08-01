"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { TextureMode } from "@/components/TextureMode";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TextureMode />
      <OnboardingGuard>{children}</OnboardingGuard>
    </QueryClientProvider>
  );
}
