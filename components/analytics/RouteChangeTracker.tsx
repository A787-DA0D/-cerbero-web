"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function RouteChangeTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!id) return;

    const sp = typeof window !== "undefined" ? window.location.search : "";
    const page_path = sp ? `${pathname}${sp}` : pathname;

    // Send SPA pageview
    window.gtag?.("config", id, { page_path });
  }, [pathname]);

  return null;
}
