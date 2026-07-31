import type { Metadata } from "next";
import LegacyPage, { getLegacyEntry } from "@/components/LegacyPage";

const SLUG = "wedd";

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
