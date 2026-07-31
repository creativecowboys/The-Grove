import type { Metadata } from "next";
import LegacyPage, { getLegacyEntry } from "@/components/LegacyPage";

const SLUG = "find-the-best-west-georgia-wedding-venue-for-your-big-day";

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
