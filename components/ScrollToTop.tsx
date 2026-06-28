"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ensures the page always starts at the top:
 *  - On route changes (including navigating between [space] pages, which
 *    reuse the same route segment and don't always trigger Next's scroll reset)
 *  - On reload (browsers restore the previous scroll position by default;
 *    setting scrollRestoration to "manual" disables that)
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Respect in-page anchor links if any are ever used
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
