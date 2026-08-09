import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Lato } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AttributionTracker from "@/components/AttributionTracker";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  // Lets every page's `alternates.canonical` resolve to an absolute URL.
  metadataBase: new URL("https://thegroveatdefoorfarm.com"),
  title: "The Grove at DeFoor Farm | Wedding Venue in Temple, GA",
  description:
    "A family-owned wedding and corporate event venue in Temple, Georgia. Four ceremony sites, a 7,200 sq ft barn for up to 200 guests, and a 6-acre lake.",
  alternates: { canonical: "/" },
  // Icons come from the app/ file conventions (favicon.ico, icon.png,
  // apple-icon.png) — the venue's original square mark from the old site.
  // Don't set `icons` here or it overrides those.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${lato.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <ScrollToTop />
        <AttributionTracker />
        <Header />
        <main className="flex-grow pt-[104px] md:pt-[116px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
