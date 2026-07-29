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
  sideImages?: string[];
  sideImagePositions?: string[];
  photoCredit?: string;
  sideImageCredits?: (string | undefined)[];
  sidePosition?: string;
  description: string;
  aboutHeading?: string;
  scriptTagline?: string;
  imageLeft?: boolean;
  highlights?: string[];
  gallery?: string[];
  galleryPositions?: string[];
}

const spacesData: Record<string, SpaceDetails> = {
  "bridal-suite": {
    name: "Bridal Suite",
    tagline: "A Private Sanctuary for Preparation",
    category: "Luxury Amenities",
    img: "/images/grove/The-Grove-at-Defoor-Farms_2500-19.jpg",
    position: "object-center",
    aboutHeading: "About the Bridal Suite",
    imageLeft: true,
    description: "Our Bridal Suite is nestled within The Barn, featuring three hair and make-up vanities with a large open sitting area. The suite is also equipped with a kitchen, coffee bar, microwave, and refrigerator. Last but not least, a luxurious bath with a free standing tub, large tile shower, double vanity, and water closet.",
    sideImages: [
      "/images/grove/bridal-lounge-mirror.jpg",
      "/images/grove/bridal-lounge-bar.jpg",
      "/images/grove/bridal-bath-shower.jpg",
      "/images/grove/bridal-bath-tub.jpg",
    ],
  },
  "grooms-lodge": {
    name: "Grooms Lodge",
    tagline: "Relax, Unwind, and Connect",
    category: "Luxury Amenities",
    img: "/images/grove/grooms-lodge-hero.jpg",
    position: "object-center",
    sideImg: "/images/grove/The-Grove-at-Defoor-Farms_2500-4Web.jpg",
    sidePosition: "object-center",
    aboutHeading: "About the Grooms Lodge",
    imageLeft: true,
    description: "Our Grooms Lodge offers a private space with a living room and game room, complete with a pool table, shuffle board, and large screen TV. It is also equipped with a full bath and dressing room, and groomsmen have access to our patio and pool area.",
  },
  "oaklin": {
    name: "Oaklin",
    tagline: "Under the Canopy of the Aged Oak",
    category: "Ceremony Sites",
    img: "/images/grove/oaklin-ceremony-crowd.jpg",
    position: "object-center",
    sideImages: [
      "/images/Oaklin/IMG_1978.JPG",
      "/images/Oaklin/IMG_1560-1.jpg",
      "/images/Oaklin/IMG_1562-1.jpg",
      "/images/Oaklin/IMG_1979.jpeg",
      "/images/Oaklin/TGDF-64_warm.png",
    ],
    sideImagePositions: [
      "object-bottom",
      "object-bottom",
      "object-center",
      "object-center",
      "object-[center_60%]",
    ],
    description: "Oaklin sits beneath a large, aged oak tree overlooking the lake. The oak's wide canopy frames the ceremony while the water stretches out beyond it, and the site comfortably accommodates up to 200 guests. It's a natural, established setting that needs little added to it.",
    aboutHeading: "About Oaklin",
    scriptTagline: "Strong and resilient, like the oak itself",
    imageLeft: true,
  },
  "willow": {
    name: "Willow",
    tagline: "Serenity by the Shore",
    category: "Ceremony Sites",
    img: "/images/willow.jpg",
    position: "object-[30%_98%]",
    description: 'This wedding site is settled directly beside the lake, edged in by a beautiful stone sea wall. The willow tree is full of symbolism such as hope and safety. Say "I do" at our Willow site, declaring to be a source of hope and safety for your life-long partner.',
    aboutHeading: "About Willow",
    scriptTagline: "A symbol of hope and safety",
    imageLeft: true,
    sideImages: [
      "/images/grove/willow-arch-lakeside.jpg",
      "/images/grove/willow-benches-wide.jpg",
      "/images/grove/willow-aerial-benches.jpg",
      "/images/grove/willow-aerial-ceremony.jpg",
      "/images/grove/willow-aerial-bride.jpg",
    ],
  },
  "the-grove": {
    name: "The Grove",
    tagline: "Whispering Brooks and Shaded Glades",
    category: "Ceremony Sites",
    img: "/images/grove-site.jpg",
    position: "object-center",
    aboutHeading: "About The Grove",
    imageLeft: true,
    description: "Surrounded by large trees, a flowing brook with small waterfalls, and a view of the lake, The Grove is undoubtedly one of our favorite sites. We are sure it will become one of yours as well.",
  },
  "chapel": {
    name: "The Chapel",
    tagline: "An Open-Air Sanctuary",
    category: "Ceremony Sites",
    img: "/images/grove/chapel-benches-warm.jpg",
    position: "object-center",
    aboutHeading: "About the Chapel",
    imageLeft: true,
    photoCredit: "Brittany Sloan",
    sideImageCredits: [
      "Brittany Sloan", // chapel-ceremony-wide
      "Hannah Langford", // chapel-ceremony-cross
      "Brittany Sloan", // chapel-processional
      "Brittany Sloan", // chapel-doors-entrance
      "Brittany Sloan", // chapel-doors-closed
    ],
    description: "Our open-air chapel offers a covered ceremony space with handcrafted wooden benches, chandelier lighting, and flowing white drapes, framed by sliding barn doors with a view of the grounds. Rain or shine, it's a beautiful place to gather for the moment that matters most.",
    sideImages: [
      "/images/grove/chapel-ceremony-wide.jpg",
      "/images/grove/chapel-ceremony-cross.jpg",
      "/images/grove/chapel-processional.jpg",
      "/images/grove/chapel-doors-entrance.jpg",
      "/images/grove/chapel-doors-closed.jpg",
    ],
  },
  "the-barn": {
    name: "The Barn",
    tagline: "Southern Charm and Modern Luxury",
    category: "Venue Features",
    img: "/images/grove/The-Grove-at-Defoor-Farms_2500-90.jpg",
    position: "object-center",
    sideImages: [
      "/images/grove/The-Grove-at-Defoor-Farms_2500-10.jpg",
      "/images/grove/barn-reception-pampas.jpg",
      "/images/grove/barn-tables-brick.jpg",
      "/images/grove/barn-patio-fountain.jpg",
      "/images/grove/barn-patio-lights.jpg",
      "/images/grove/barn-across-lake-flowers.jpg",
      "/images/grove/barn-night-party.jpg",
      "/images/grove/barn-exterior-lakeside.jpg",
      "/images/grove/barn-front-walkway.jpg",
      "/images/grove/barn-cake-neon-sign.jpg",
    ],
    sidePosition: "object-center",
    aboutHeading: "About the Barn",
    imageLeft: true,
    description: "The Barn offers 7,200 square feet of conditioned or open-air space overlooking the lake, with tables and chairs for up to 200 guests. The space also features a fireplace and TV.",
  },
  "the-lake": {
    name: "The Lake",
    tagline: "Six Acres of Pristine Tranquility",
    category: "Venue Features",
    img: "/images/across-the-lake.jpg",
    position: "object-center",
    sideImg: "/images/grove/lake-chairs-firepit.jpg",
    sidePosition: "object-center",
    aboutHeading: "About the Lake",
    imageLeft: true,
    description: "We have a beautiful 6 acre lake with two docks. The first dock features a covered seating area while the second dock features a swing. We also have several seating areas around the lake to view the beautiful lit fountain.",
  },
};

export default function SpacePage() {
  const params = useParams();
  const slug = typeof params.space === "string" ? params.space : "";
  const space = spacesData[slug];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sideImages =
    space?.sideImages && space.sideImages.length > 0 ? space.sideImages : null;
  const [sideIdx, setSideIdx] = useState(0);

  // Credit follows the visible slide, falling back to a page-wide credit
  const activeCredit = sideImages
    ? space?.sideImageCredits?.[sideIdx % sideImages.length] ?? space?.photoCredit
    : space?.photoCredit;

  useEffect(() => {
    if (!sideImages || sideImages.length < 2) return;
    const timer = setInterval(
      () => setSideIdx((i) => (i + 1) % sideImages.length),
      6000
    );
    return () => clearInterval(timer);
  }, [sideImages]);

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

  const inquiryCard = (
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
  );

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
        <div className="relative z-10 text-center text-white px-6 cursor-default select-none">
          <p className="text-gold-light tracking-[0.3em] text-xs font-bold uppercase mb-4 text-shadow-sm">
            {space.category}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            {space.name}
          </h1>
          <div className="w-16 h-px bg-gold-light mx-auto mt-6" />
          <p className="text-white/80 font-serif italic text-lg sm:text-xl mt-4">
            {space.tagline}
          </p>
        </div>
      </section>

      {/* ── Main Details ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Text Column: Description & Highlights */}
            <div className={`space-y-10 ${space.imageLeft ? "lg:col-span-5 lg:order-2" : "lg:col-span-7"}`}>
              <div>
                <span className="text-gold font-bold tracking-[0.2em] text-xs uppercase block mb-3">
                  Overview
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-bark font-bold mb-6">
                  {space.aboutHeading || "About the Space"}
                </h2>
                {space.scriptTagline && (
                  <p className="font-script text-3xl sm:text-4xl text-gold -mt-3 mb-6">
                    {space.scriptTagline}
                  </p>
                )}
                <div className="w-12 h-px bg-gold mb-6" />
                <p className="text-bark/85 leading-relaxed text-lg" style={{ textAlign: "justify" }}>
                  {space.description}
                </p>
              </div>

              {space.imageLeft && <div className="hidden lg:block">{inquiryCard}</div>}

              {space.highlights && space.highlights.length > 0 && (
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
              )}
            </div>

            {/* Image Column: Detail Image & Mini CTA Card */}
            <div className={`space-y-8 ${space.imageLeft ? "lg:col-span-7 lg:order-1" : "lg:col-span-5 lg:sticky lg:top-36"}`}>
              {/* Secondary Details Image / Carousel */}
              <div className="relative border border-bark/10 shadow-sm overflow-hidden">
                <div className={`relative ${space.imageLeft ? "h-96 lg:h-[560px]" : "h-80"}`}>
                  {(sideImages || [space.sideImg || space.img]).map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`${space.name} Detail ${i + 1}`}
                      style={{ opacity: i === (sideImages ? sideIdx % sideImages.length : 0) ? 1 : 0 }}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                        sideImages
                          ? space.sideImagePositions?.[i] || "object-center"
                          : space.sidePosition || space.position || "object-center"
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 border border-gold/15 m-3 pointer-events-none" />

                {sideImages && sideImages.length > 1 && (
                  <>
                    <button
                      aria-label="Previous photo"
                      onClick={() =>
                        setSideIdx((i) => (i - 1 + sideImages.length) % sideImages.length)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/35 hover:bg-black/55 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      aria-label="Next photo"
                      onClick={() => setSideIdx((i) => (i + 1) % sideImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/35 hover:bg-black/55 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {sideImages.map((_, i) => (
                        <button
                          key={i}
                          aria-label={`Photo ${i + 1}`}
                          onClick={() => setSideIdx(i)}
                          className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                            i === sideIdx % sideImages.length ? "bg-white" : "bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {activeCredit && (
                <p className="-mt-4 text-right text-[11px] tracking-wider text-bark/45 italic">
                  Photography by {activeCredit}
                </p>
              )}

              {/* Booking/Inquiry Prompt (in-column on default layout; below image on mobile for image-left layout) */}
              {!space.imageLeft ? inquiryCard : <div className="lg:hidden">{inquiryCard}</div>}
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
