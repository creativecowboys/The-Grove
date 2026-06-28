import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  title: "The Grove at DeFoor Farm | West Georgia's Premiere Event Venue",
  description: "The Grove at DeFoor Farm — Where Shared Memories Are Made. Beautiful weddings, corporate retreats, and social events in West Georgia.",
  icons: {
    icon: "/images/grove/TheGroveLogo-1024x172.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <Header />
        <main className="flex-grow pt-[104px] md:pt-[116px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
