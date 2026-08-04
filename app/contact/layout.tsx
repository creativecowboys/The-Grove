import type { Metadata } from "next";

// The Contact page is a client component and can't export metadata itself.
export const metadata: Metadata = {
  title: "Contact & Tours | The Grove at DeFoor Farm",
  description:
    "Schedule a private tour of The Grove at DeFoor Farm in Temple, Georgia. Send an inquiry about wedding and corporate event dates, pricing and availability.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
