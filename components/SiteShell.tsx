"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import AttributionTracker from "./AttributionTracker";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/leads" || pathname.startsWith("/leads/")) return <main className="flex-grow">{children}</main>;
  return <><AttributionTracker /><Header /><main className="flex-grow pt-[104px] md:pt-[116px]">{children}</main><Footer /></>;
}
