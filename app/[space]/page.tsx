"use client";

import React, { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SpaceDetails {
  name: string;
  tagline: string;
  category: string;
  img: string;
  position?: string;
  sideImg?: string;
  sidePosition?: string;
  description: string;
  highlights: string[];
  gallery?: string[];
  galleryPositions?: string[];
}

const spacesData: Record<string, SpaceDetails> = {
  "bridal-suite": {
    name: "Bridal Suite",
    tagline: "A Private Sanctuary for Preparation",
    category: "Luxury Amenities",
    img: "/images/bridal-suite.jpg",
    position: "object-center",
    description: "Nestled within The Barn, our Bridal Suite is designed to offer comfort, luxury, and a perfect prep space for the bridal party. From professional makeup setups to a private kitchen and luxurious bath, every detail has been curated to make your wedding morning prep stress-free.",
    highlights: [
      "Three professional hair & makeup vanities with custom mirror lighting",
      "Large open lounge/sitting area with premium cream furniture and full-length mirrors",
      "Full kitchen setup equipped with a coffee bar, microwave, sink, and refrigerator",
      "Luxurious private master bathroom featuring a free-standing soaking tub, large tiled walk-in shower, double vanity, and water closet",
      "Generous double-closet hanging spaces for bridal gowns and bridesmaid dresses",
    ],
  },
  "grooms-lodge": {
    name: "Grooms Lodge",
    tagline: "Relax, Unwind, and Connect",
    category: "Luxury Amenities",
    img: "/images/grooms-lodge.jpg",
    position: "object-center",
    description: "Tucked away to offer privacy, the Grooms Lodge is a premium retreat for the groom and groomsmen. Loaded with entertainment, games, and lounge options, it offers the ultimate space to relax and prepare for the big day.",
    highlights: [
      "Private gaming room featuring a regulation pool table and shuffleboard table",
      "Spacious living area with leather couches and a large screen smart TV",
      "Full private bathroom and spacious dedicated dressing room",
      "Direct access to the outdoor patio and swimming pool area",
      "Stocked bar area with mini-fridge for refreshments and cold drinks",
    ],
  },
  "oaklin": {
    name: "Oaklin Site",
    tagline: "Under the Canopy of the Aged Oak",
    category: "Ceremony Sites",
    img: "/images/Oaklin/TGDF-64_warm.png",
    position: "object-[center_60%]",
    sideImg: "/images/Oaklin/IMG_1978.JPG",
    sidePosition: "object-bottom",
    description: "Named after our majestic century-old oak tree, the Oaklin ceremony site is a perfect place to unite in marriage. With its grand canopy and pastoral beauty, this site stands as a symbol of strength and long-lasting devotion.",
    highlights: [
      "Panoramic backdrop featuring the historic aged oak tree canopy",
      "Lush, manicured grassy lawn with guest seating capacity for up to 200 guests",
      "Symmetrical stone paving path for the bridal entrance walk",
      "Surrounded by soft rolling hills and beautiful woodlands",
      "Gorgeous golden-hour lighting filtering through the oak tree branches",
    ],
    gallery: [
      "/images/Oaklin/IMG_1978.JPG",
      "/images/Oaklin/IMG_1560-1.jpg",
      "/images/Oaklin/IMG_1562-1.jpg",
      "/images/Oaklin/IMG_1979.jpeg",
    ],
    galleryPositions: [
      "object-center", // IMG_1978.JPG
      "object-bottom", // IMG_1560-1.jpg (shifted up to see people)
      "object-center", // IMG_1562-1.jpg
      "object-center", // IMG_1979.jpeg
    ],
  },
  "willow": {
    name: "Willow Site",
    tagline: "Serenity by the Shore",
    category: "Ceremony Sites",
    img: "/images/willow.jpg",
    position: "object-center",
    description: 'This wedding site is settled directly beside the lake, edged in by a beautiful stone sea wall. The willow tree is full of symbolism such as hope and safety. Say "I do" at our Willow site, declaring to be a source of hope and safety for your life-long partner.',
    highlights: [
      "Waterfront ceremony setting framed by a weeping willow tree",
      "Custom stone-paved sea wall and walkway along the lake",
      "Exceptional view of the central lake fountain and docks",
      "Waterfront breeze and tranquil environment",
      "Seating space customizable up to 200 guests",
    ],
  },
  "the-grove": {
    name: "The Grove Site",
    tagline: "Whispering Brooks and Shaded Glades",
    category: "Ceremony Sites",
    img: "/images/grove-site.jpg",
    position: "object-center",
    description: "As one of our absolute favorite sites on the farm, The Grove is an enchanted clearing enveloped by mature, towering trees, a babbling brook with natural small waterfalls, and a clear vista of the lake. It is the ideal site for nature lovers.",
    highlights: [
      "Lush green clearing bordered by whispering brooks and small waterfalls",
      "Unique woodland aesthetic with towering trees providing natural shade",
      "Picturesque wooden bridge crossings for unique photo opportunities",
      "Direct visual framing of the lake in the background",
      "Romantic, quiet ambiance ideal for intimate vow exchanges",
    ],
  },
  "the-barn": {
    name: "The Barn",
    tagline: "Rustic Grandeur and Modern Luxury",
    category: "Venue Features",
    img: "/images/barn.jpg",
    position: "object-center",
    description: "Our majestic 7,200 square foot climate-controlled barn is the central hub of The Grove at DeFoor Farm. Featuring a gorgeous limestone fireplace, high ceilings, custom lighting, and wide open-air options, it sets a premium stage for grand receptions and corporate retreats.",
    highlights: [
      "7,200 square feet of climate-controlled, open-concept event space",
      "Accommodates tables and elegant cross-back chairs for up to 200 guests",
      "Stately floor-to-ceiling stone fireplace and large flatscreen media capabilities",
      "Large sliding barn doors that open to lake views and fresh breezes",
      "Equipped with lighting rigs, sound hookups, and prep areas for vendors",
    ],
  },
  "the-lake": {
    name: "The Lake",
    tagline: "Six Acres of Pristine Tranquility",
    category: "Venue Features",
    img: "/images/lake.jpg",
    position: "object-center",
    description: "Our scenic 6-acre lake serves as the beautiful backdrop for the entire property. Featuring two distinct docks—one covered and one with a custom wooden swing—the lake is surrounded by quiet seating areas and a gorgeous lit fountain that sparkles at night.",
    highlights: [
      "6 acres of spring-fed lake water reflecting beautiful Georgia sunsets",
      "Two custom wooden docks (one covered seating dock, one swings dock)",
      "Lit central fountain creating a sparkling night backdrop",
      "Scenic trails and gravel walking paths surrounding the shore",
      "Ideal for golden-hour portraits, cocktail hour, and lakeside strolls",
    ],
  },
};

export default function SpacePage() {
  const params = useParams();
  const slug = typeof params.space === "string" ? params.space : "";
  const space = spacesData[slug];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null || !space?.gallery) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % space.gallery!.length : null));
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + space.gallery!.length) % space.gallery!.length : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, space]);

  if (!space) {
    notFound();
  }

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (space.gallery) {
      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % space.gallery!.length : null));
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (space.gallery) {
      setLightboxIndex((prev) =>
        prev !== null ? (prev - 1 + space.gallery!.length) % space.gallery!.length : null
      );
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* ── Header Banner ── */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={space.img}
            alt={space.name}
            className="w-full h-full object-cover"
            style={{
              filter: "brightness(0.35)",
              objectPosition: space.position ? 
                (space.position === "object-bottom" ? "bottom" :
                 space.position === "object-center" ? "center" :
                 space.position === "object-top" ? "top" :
                 space.position.replace("object-[", "").replace("]", "").replace("_", " "))
                : "center"
            }}
          />
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <p className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-4">
            {space.category}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            {space.name}
          </h1>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
          <p className="text-white/80 font-serif italic text-lg sm:text-xl mt-4">
            {space.tagline}
          </p>
        </div>
      </section>

      {/* ── Main Details ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Left Column: Description & Highlights (7 cols) */}
            <div className="lg:col-span-7 space-y-10">
              <div>
                <span className="text-gold font-bold tracking-[0.2em] text-xs uppercase block mb-3">
                  Overview
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-bark font-bold mb-6">
                  About the Space
                </h2>
                <div className="w-12 h-px bg-gold mb-6" />
                <p className="text-bark/85 leading-relaxed text-lg" style={{ textAlign: "justify" }}>
                  {space.description}
                </p>
              </div>

              <div>
                <span className="text-gold font-bold tracking-[0.2em] text-xs uppercase block mb-6">
                  Key Amenities & Specs
                </span>
                <ul className="space-y-4">
                  {space.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cream text-gold flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-bark/80 text-base leading-relaxed">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Mini CTA Card & Image Detail (5 cols) */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-36">
              {/* Secondary Details Image */}
              <div className="relative border border-bark/10 shadow-sm overflow-hidden">
                <img
                  src={space.sideImg || space.img}
                  alt={`${space.name} Detail`}
                  className={`w-full h-80 object-cover ${space.sidePosition || space.position || "object-center"}`}
                />
                <div className="absolute inset-0 border border-gold/15 m-3 pointer-events-none" />
              </div>

              {/* Booking/Inquiry Prompt */}
              <div className="bg-cream border border-bark/10 p-8 shadow-sm">
                <h3 className="font-serif text-2xl text-bark font-bold mb-2">
                  Interested in {space.name}?
                </h3>
                <p className="text-taupe text-sm leading-relaxed mb-6">
                  Schedule a private tour to walk through the grounds and see this space in person.
                </p>
                <Link
                  href="/contact"
                  className="group w-full inline-flex items-center justify-center gap-3 bg-gold hover:bg-gold-dark text-white text-sm font-bold tracking-widest uppercase py-4 transition-all duration-300 shadow-md shadow-gold/10"
                >
                  Book Private Tour
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo Gallery Section ── */}
      {space.gallery && space.gallery.length > 0 && (
        <section className="py-20 lg:py-28 bg-cream border-t border-bark/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-gold font-bold tracking-[0.2em] text-xs uppercase block mb-3">
                Gallery
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-bark font-bold">
                Experience {space.name}
              </h2>
              <div className="w-12 h-px bg-gold mx-auto mt-4" />
            </div>

            {/* Grid layout: 4 columns on large screens, 2 columns (2x2) on breakpoints */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {space.gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="relative overflow-hidden aspect-[4/3] bg-white border border-bark/10 shadow-sm cursor-pointer group"
                >
                  <img
                    src={imgUrl}
                    alt={`${space.name} Gallery Image ${idx + 1}`}
                    className={`w-full h-full object-cover ${
                      space.galleryPositions?.[idx] || "object-center"
                    } transition-transform duration-500 group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xs tracking-widest uppercase font-bold border border-white/40 px-4 py-2 bg-black/20">
                      View Large
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Lightbox Overlay ── */}
      <AnimatePresence>
        {lightboxIndex !== null && space.gallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Prev Button */}
            <button
              onClick={prevImage}
              className="absolute left-6 text-white/40 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Next Button */}
            <button
              onClick={nextImage}
              className="absolute right-6 text-white/40 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Active Image */}
            <div className="max-w-5xl max-h-[85vh] flex flex-col items-center gap-4">
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={space.gallery[lightboxIndex]}
                alt={`${space.name} Gallery Zoomed`}
                className="max-w-full max-h-[75vh] object-contain select-none shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="text-center text-white">
                <span className="text-gold text-xs tracking-widest uppercase font-bold block mb-1">
                  {space.name}
                </span>
                <h2 className="font-serif text-lg font-bold">
                  Image {lightboxIndex + 1} of {space.gallery.length}
                </h2>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
