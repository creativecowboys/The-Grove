import type { Metadata } from "next";
import LegacyPage, { getLegacyEntry } from "@/components/LegacyPage";

const SLUG = "the-grove-at-defoor-farm-a-timeless-wedding-venue-near-kennesaw-ga";

export function generateMetadata(): Metadata {
  const entry = getLegacyEntry(SLUG);
  return {
    title: entry?.seoTitle || entry?.title,
    description: entry?.seoDescription || undefined,
    alternates: { canonical: `/${SLUG}` },
  };
}

export default function Page() {
  return <LegacyPage slug={SLUG} />;
}
