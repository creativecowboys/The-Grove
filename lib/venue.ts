// One source of truth for the venue's name, address and the facts the city
// pages and structured data repeat. Keep it in step with the Google Business
// Profile (location 94264): Google cross-checks the two.

export const SITE_URL = "https://thegroveatdefoorfarm.com";

export const VENUE = {
  name: "The Grove at DeFoor Farm",
  street: "844 McBrayer Road",
  city: "Temple",
  region: "GA",
  postalCode: "30179",
  email: "info@thegroveatdefoorfarm.com",
  // US Census geocoder match for 844 McBrayer Rd (Paulding County).
  geo: { lat: 33.824812, lng: -85.020871 },
  mapsUrl: "https://maps.google.com/maps?cid=14466736877763448152",
  sameAs: [
    "https://www.facebook.com/thegroveatdefoorfarm",
    "https://www.instagram.com/thegroveatdefoorfarm/",
  ],
  capacity: 200,
} as const;

export const VENUE_ID = `${SITE_URL}/#venue`;

/** Google Maps driving directions to the venue from a starting place. */
export function directionsUrl(origin: string): string {
  const dest = `${VENUE.name}, ${VENUE.street}, ${VENUE.city}, ${VENUE.region} ${VENUE.postalCode}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
}

export type CityGuide = {
  slug: string;
  city: string;
  county: string;
  /** Road miles from the city centre to the venue (OSRM, Nov 2026). */
  miles: number;
  /** Rounded drive time with no traffic. OSRM free-flow times run short, so these are rounded up. */
  minutes: string;
  /** How most guests drive in, in plain words. */
  route: string;
};

// Distances: OpenStreetMap routing from each city centre to 844 McBrayer Rd,
// run 2026-11-10. Times are rounded up from free-flow estimates.
export const CITY_GUIDES: CityGuide[] = [
  {
    slug: "wedding-venue-near-villa-rica-georgia",
    city: "Villa Rica",
    county: "Carroll County",
    miles: 10,
    minutes: "about 20 minutes",
    route: "Head north out of Villa Rica on Rockmart Road and GA 101, then turn onto McBrayer Road. It is a back-roads drive the whole way, with no interstate.",
  },
  {
    slug: "wedding-venue-near-dallas-georgia",
    city: "Dallas",
    county: "Paulding County",
    miles: 14,
    minutes: "20 to 25 minutes",
    route: "From downtown Dallas, take GA 120 west toward Temple. The venue is on the Paulding County side of the Temple mailing area, so Dallas guests never have to get on the interstate.",
  },
  {
    slug: "wedding-venue-near-bremen-georgia",
    city: "Bremen",
    county: "Haralson County",
    miles: 14,
    minutes: "about 25 minutes",
    route: "Take US 78 east out of Bremen, cut north on Cashtown Road, and pick up GA 120 to the venue.",
  },
  {
    slug: "wedding-venue-near-carrollton-georgia",
    city: "Carrollton",
    county: "Carroll County",
    miles: 22,
    minutes: "about 35 minutes",
    route: "Take GA 113 north out of Carrollton through Temple, then follow GA 120 the rest of the way.",
  },
  {
    slug: "wedding-venue-near-douglasville-georgia",
    city: "Douglasville",
    county: "Douglas County",
    miles: 22,
    minutes: "about 35 minutes",
    route: "Take I-20 west to the Villa Rica exit (GA 61), then GA 101 north to McBrayer Road.",
  },
  {
    slug: "wedding-venue-near-kennesaw-ga",
    city: "Kennesaw",
    county: "Cobb County",
    miles: 32,
    minutes: "about 50 minutes",
    route: "Head southwest through Acworth and Dallas on GA 120, which carries you almost all the way to the venue.",
  },
  {
    slug: "wedding-venue-near-newnan-georgia",
    city: "Newnan",
    county: "Coweta County",
    miles: 44,
    minutes: "a little over an hour",
    route: "Take US 27 Alternate toward Carrollton, then head north on GA 113 through Temple and finish on GA 120.",
  },
];

export const TEMPLE_SLUG = "wedding-venue-in-temple-georgia";

/** Distances out-of-town guests ask about, used on every city page. */
export const FROM_ATLANTA = [
  { place: "Downtown Atlanta", miles: 43, minutes: "about an hour", origin: "Downtown Atlanta, GA" },
  { place: "Hartsfield-Jackson Atlanta Airport (ATL)", miles: 49, minutes: "about 75 minutes", origin: "Hartsfield-Jackson Atlanta International Airport" },
];

export function getCityGuide(slug: string): CityGuide | undefined {
  return CITY_GUIDES.find((c) => c.slug === slug);
}

/** Facts-only FAQ for a city page. Every answer repeats copy already on the site. */
export function cityFaqs(c: CityGuide): { q: string; a: string }[] {
  return [
    {
      q: `How far is The Grove at DeFoor Farm from ${c.city}?`,
      a: `About ${c.miles} miles, ${c.minutes} by car without traffic. ${c.route}`,
    },
    {
      q: "How many guests can The Grove hold?",
      a: "The Barn has 7,200 square feet of conditioned or open-air space overlooking the lake, with tables and chairs for up to 200 guests.",
    },
    {
      q: "Can we have the ceremony and reception in the same place?",
      a: "Yes. Choose one of four ceremony sites (Oaklin, Willow, The Grove, or the open-air chapel), then move to the Barn for the reception without anyone getting back in a car.",
    },
    {
      q: "Where do the couple and wedding party get ready?",
      a: "The Bridal Suite inside the Barn has three hair and makeup vanities, a kitchen and coffee bar, and a full bath. The Grooms Lodge has a living room, game room with a pool table and shuffleboard, and a full bath.",
    },
    {
      q: "Can we tour the venue before we book?",
      a: "Yes. Private tours are by appointment. Send a note through the contact page and the team will set a time; office hours are Monday through Friday, 9 AM to 5 PM.",
    },
  ];
}
