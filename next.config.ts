import type { NextConfig } from "next";

// Legacy WordPress URLs that Google still has indexed. Each 301 hands the
// old page's link equity to its closest live equivalent. Specific rules must
// stay above the catch-alls — Next.js matches top-down.
const legacyRedirects = [
  // Old top-level WordPress pages
  { source: "/weddings", destination: "/wedding-venue-in-temple-georgia" },
  { source: "/venue", destination: "/wedding-venue-in-temple-georgia" },
  { source: "/gallery", destination: "/about" },
  { source: "/photography-sessions", destination: "/about" },
  { source: "/events", destination: "/" },
  { source: "/corporate-events", destination: "/" },
  { source: "/birthday-parties", destination: "/" },
  { source: "/graduation-celebrations", destination: "/" },
  { source: "/reunions", destination: "/" },
  { source: "/sample-page", destination: "/" },
  { source: "/2021/11/03/hello-world", destination: "/" },

  // Tag archives with a good topical home
  { source: "/tag/kennesaw-wedding-venue", destination: "/wedding-venue-near-kennesaw-ga" },
  { source: "/tag/west-georgia-wedding-venue", destination: "/wedding-venue-in-temple-georgia" },

  // Category archive with a good topical home
  { source: "/category/wedding-planning", destination: "/how-to-select-a-wedding-venue" },

  // Catch-alls for the remaining WordPress cruft
  { source: "/tag/:slug*", destination: "/" },
  { source: "/category/:slug*", destination: "/" },
  { source: "/author/:slug*", destination: "/" },
  { source: "/wp-content/:path*", destination: "/" },
  { source: "/wp-admin/:path*", destination: "/" },
  { source: "/wp-login.php", destination: "/" },
  { source: "/wp-comments-post.php", destination: "/" },
  { source: "/feed", destination: "/" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }));
  },
};

export default nextConfig;
