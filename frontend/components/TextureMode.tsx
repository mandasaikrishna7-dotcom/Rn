"use client";

import { useEffect } from "react";
import { useBootstrap } from "@/hooks/useApi";

/**
 * Applies the reduced-texture accessibility setting to <html> as
 * `data-texture="reduced"` (CSS hooks in globals.css).
 */
export function TextureMode() {
  const { data } = useBootstrap();

  useEffect(() => {
    const reduced = Boolean(data?.settings?.reduced_texture);
    document.documentElement.dataset.texture = reduced ? "reduced" : "full";
  }, [data?.settings?.reduced_texture]);

  return null;
}
