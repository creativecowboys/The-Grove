import { SITE_URL, VENUE, VENUE_ID, CITY_GUIDES } from "@/lib/venue";

/** Renders one JSON-LD block. `<` is escaped per the Next.js JSON-LD guide. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Sitewide venue entity. Mirrors the Google Business Profile. */
export function venueSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EventVenue"],
    "@id": VENUE_ID,
    name: VENUE.name,
    url: `${SITE_URL}/`,
    email: VENUE.email,
    image: [
      `${SITE_URL}/images/grove/barn-drone-dusk.jpg`,
      `${SITE_URL}/images/grove/barn-exterior-lakeside.jpg`,
      `${SITE_URL}/images/grove/chapel-ceremony-wide.jpg`,
    ],
    logo: `${SITE_URL}/images/grove/TheGroveLogo-1024x172.png`,
    description:
      "A family-owned wedding and event venue in Temple, Georgia, with four ceremony sites, a 7,200 sq ft barn for up to 200 guests, a 6-acre lake, a bridal suite and a grooms lodge.",
    address: {
      "@type": "PostalAddress",
      streetAddress: VENUE.street,
      addressLocality: VENUE.city,
      addressRegion: VENUE.region,
      postalCode: VENUE.postalCode,
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: VENUE.geo.lat, longitude: VENUE.geo.lng },
    hasMap: VENUE.mapsUrl,
    sameAs: VENUE.sameAs,
    maximumAttendeeCapacity: VENUE.capacity,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Temple, GA" },
      ...CITY_GUIDES.map((c) => ({ "@type": "City", name: `${c.city}, GA` })),
      { "@type": "Place", name: "West Georgia" },
    ],
    amenityFeature: [
      "Four ceremony sites",
      "7,200 sq ft climate-controlled barn",
      "6-acre lake with two docks",
      "Bridal suite",
      "Grooms lodge",
      "Warming kitchen",
    ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  };
}
