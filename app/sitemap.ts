import type { MetadataRoute } from "next";
import legacy from "@/lib/legacy-content.json";

export const SITE_URL = "https://thegroveatdefoorfarm.com";

const spaces = [
  "bridal-suite",
  "grooms-lodge",
  "oaklin",
  "willow",
  "the-grove",
  "chapel",
  "the-barn",
  "the-lake",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];

  const spacePages: MetadataRoute.Sitemap = spaces.map((s) => ({
    url: `${SITE_URL}/${s}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const legacyPages: MetadataRoute.Sitemap = Object.values(
    legacy as unknown as Record<string, { slug: string; kind: string; modified?: string }>
  ).map((e) => ({
    url: `${SITE_URL}/${e.slug}`,
    lastModified: e.modified ? new Date(e.modified) : now,
    changeFrequency: "yearly",
    // location landing pages carry more commercial intent than blog posts
    priority: e.kind === "page" ? 0.8 : 0.6,
  }));

  return [...core, ...spacePages, ...legacyPages];
}
