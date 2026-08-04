import type { Metadata } from "next";

// The About page is a client component and can't export metadata itself.
export const metadata: Metadata = {
  title: "About | The Grove at DeFoor Farm",
  description:
    "A family-owned event venue in Temple, Georgia. Originally a working pasture, the land was transformed into a venue centered on a 7,200 sq ft climate-controlled barn overlooking a 6-acre lake.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
