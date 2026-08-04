import type { Metadata } from "next";

/**
 * The space page itself is a client component, so it can't export metadata —
 * without this every space inherited the root layout's title and description,
 * leaving eight pages that looked identical to Google.
 *
 * Titles/descriptions below are drawn from each page's own on-page copy;
 * nothing here claims anything the page doesn't already say.
 */
const META: Record<string, { title: string; description: string }> = {
  "bridal-suite": {
    title: "Bridal Suite | The Grove at DeFoor Farm",
    description:
      "A private bridal suite inside The Barn with three hair and make-up vanities, a large sitting area, kitchen and coffee bar, and a bath with a free standing tub.",
  },
  "grooms-lodge": {
    title: "Grooms Lodge | The Grove at DeFoor Farm",
    description:
      "A private grooms lodge with a living room and game room — pool table, shuffle board, large screen TV, full bath and dressing room, plus patio and pool access.",
  },
  oaklin: {
    title: "Oaklin Ceremony Site | The Grove at DeFoor Farm",
    description:
      "Oaklin sits beneath a large, aged oak overlooking the lake. The canopy frames the ceremony and the site seats up to 200 guests in West Georgia.",
  },
  willow: {
    title: "Willow Ceremony Site | The Grove at DeFoor Farm",
    description:
      "The Willow ceremony site sits beside the lake, edged by a stone sea wall — a lakeside setting for exchanging vows at The Grove at DeFoor Farm.",
  },
  "the-grove": {
    title: "The Grove Ceremony Site | The Grove at DeFoor Farm",
    description:
      "Surrounded by large trees, a flowing brook with small waterfalls and a view of the lake — one of our favorite ceremony sites in West Georgia.",
  },
  chapel: {
    title: "The Chapel | The Grove at DeFoor Farm",
    description:
      "A covered open-air chapel with handcrafted wooden benches, chandelier lighting and flowing white drapes, framed by sliding barn doors. Rain or shine.",
  },
  "the-barn": {
    title: "The Barn — 7,200 Sq Ft Reception Venue | The Grove at DeFoor Farm",
    description:
      "7,200 square feet of conditioned or open-air space overlooking the lake, with tables and chairs for up to 200 guests, a fireplace and TV.",
  },
  "the-lake": {
    title: "The Lake | The Grove at DeFoor Farm",
    description:
      "A 6-acre lake with two docks — one with covered seating, one with a swing — plus seating areas around the water and a lit fountain.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ space: string }>;
}): Promise<Metadata> {
  const { space } = await params;
  const m = META[space];
  if (!m) return {};
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `/${space}` },
    openGraph: { title: m.title, description: m.description, url: `/${space}` },
  };
}

export default function SpaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
