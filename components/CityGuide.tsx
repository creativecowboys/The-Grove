import React from "react";
import Link from "next/link";
import { Car, MapPin, Plane } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import {
  CITY_GUIDES,
  FROM_ATLANTA,
  SITE_URL,
  TEMPLE_SLUG,
  VENUE,
  VENUE_ID,
  cityFaqs,
  directionsUrl,
  getCityGuide,
} from "@/lib/venue";

const shortName = (city: string) => `Near ${city}`;

/** Links to the other city pages, so none of them sits orphaned. */
function NearbyLinks({ current }: { current: string }) {
  const others = [
    { slug: TEMPLE_SLUG, label: "In Temple" },
    ...CITY_GUIDES.map((c) => ({ slug: c.slug, label: shortName(c.city) })),
  ].filter((l) => l.slug !== current);
  return (
    <div className="mt-12">
      <h3 className="font-serif text-xl text-bark font-bold mb-4">Couples also come to us from</h3>
      <ul className="flex flex-wrap gap-2">
        {others.map((l) => (
          <li key={l.slug}>
            <Link
              href={`/${l.slug}`}
              className="inline-block border border-bark/15 px-4 py-2 text-xs font-bold tracking-widest uppercase text-bark/70 hover:text-gold hover:border-gold transition-colors"
            >
              Wedding Venue {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Faqs({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mt-12">
      <h2 className="font-serif text-2xl sm:text-3xl text-bark font-bold mb-6">Questions couples ask</h2>
      <div className="divide-y divide-bark/10 border-y border-bark/10">
        {items.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer list-none flex justify-between gap-4 font-serif text-lg text-bark font-semibold">
              {f.q}
              <span className="text-gold group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-3 text-bark/80">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function pageSchema(slug: string, title: string, faqs: { q: string; a: string }[]) {
  const url = `${SITE_URL}/${slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        about: { "@id": VENUE_ID },
        isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: VENUE.name },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

/**
 * The part of each city page that is actually about that city: real drive
 * distance and route, directions, FAQs and links to the sibling pages.
 * Renders nothing for slugs that are not city pages.
 */
export default function CityGuideSection({ slug, title }: { slug: string; title: string }) {
  if (slug === TEMPLE_SLUG) return <TempleGuide title={title} />;
  const c = getCityGuide(slug);
  if (!c) return null;
  const faqs = cityFaqs(c);

  return (
    <section className="mt-16 pt-12 border-t border-bark/10">
      <JsonLd data={pageSchema(slug, title, faqs)} />
      <p className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-3">Getting Here</p>
      <h2 className="font-serif text-2xl sm:text-3xl text-bark font-bold mb-6">
        From {c.city} to The Grove
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-cream p-5 flex gap-4 items-start">
          <Car className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
          <div>
            <p className="font-serif text-2xl text-bark font-bold">{c.miles} miles</p>
            <p className="text-sm text-bark/70">{c.minutes} from {c.city} without traffic</p>
          </div>
        </div>
        <div className="bg-cream p-5 flex gap-4 items-start">
          <Plane className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
          <div>
            <p className="font-serif text-2xl text-bark font-bold">{FROM_ATLANTA[1].miles} miles</p>
            <p className="text-sm text-bark/70">{FROM_ATLANTA[1].minutes} from ATL for out-of-town guests</p>
          </div>
        </div>
      </div>

      <p className="mb-5">{c.route}</p>
      <p className="mb-6">
        The venue address is {VENUE.street}, {VENUE.city}, {VENUE.region} {VENUE.postalCode}, in
        Paulding County on the edge of West Georgia. Couples planning a {c.city} wedding get a
        private lakeside farm setting without asking {c.county} guests to drive into Atlanta.
      </p>
      <a
        href={directionsUrl(`${c.city}, GA`)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-gold hover:text-gold-dark font-bold text-sm tracking-widest uppercase"
      >
        <MapPin className="w-4 h-4" /> Directions from {c.city}
      </a>

      <Faqs items={faqs} />
      <NearbyLinks current={slug} />
    </section>
  );
}

/** Temple is the home page for the Google profile, so it carries the full drive-time table. */
function TempleGuide({ title }: { title: string }) {
  const faqs = [
    {
      q: "Where is The Grove at DeFoor Farm?",
      a: `${VENUE.street}, ${VENUE.city}, ${VENUE.region} ${VENUE.postalCode}. The farm sits in Paulding County, between Villa Rica, Dallas and Bremen in West Georgia.`,
    },
    ...cityFaqs({ ...CITY_GUIDES[0] }).slice(1),
  ];
  const rows = [
    ...CITY_GUIDES.map((c) => ({ place: c.city, miles: c.miles, minutes: c.minutes, href: `/${c.slug}`, origin: `${c.city}, GA` })),
    ...FROM_ATLANTA.map((a) => ({ place: a.place, miles: a.miles, minutes: a.minutes, href: "", origin: a.origin })),
  ];

  return (
    <section className="mt-16 pt-12 border-t border-bark/10">
      <JsonLd data={pageSchema(TEMPLE_SLUG, title, faqs)} />
      <p className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-3">Getting Here</p>
      <h2 className="font-serif text-2xl sm:text-3xl text-bark font-bold mb-6">Drive times to The Grove</h2>
      <p className="mb-6">
        The Grove sits at {VENUE.street} in Temple, in the middle of West Georgia. Villa Rica, Dallas
        and Bremen are 20 to 25 minutes away, Carrollton and Douglasville about 35, and
        downtown Atlanta about an hour.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs tracking-widest uppercase text-bark/50 border-b border-bark/15">
              <th className="py-3 pr-4">From</th>
              <th className="py-3 pr-4">Miles</th>
              <th className="py-3 pr-4">Drive</th>
              <th className="py-3">Map</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.place} className="border-b border-bark/10">
                <td className="py-3 pr-4 font-semibold text-bark">
                  {r.href ? (
                    <Link href={r.href} className="hover:text-gold">{r.place}</Link>
                  ) : (
                    r.place
                  )}
                </td>
                <td className="py-3 pr-4">{r.miles}</td>
                <td className="py-3 pr-4">{r.minutes}</td>
                <td className="py-3">
                  <a href={directionsUrl(r.origin)} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark">
                    Directions
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-bark/50">Drive times are without traffic.</p>
      <Faqs items={faqs} />
      <NearbyLinks current={TEMPLE_SLUG} />
    </section>
  );
}
