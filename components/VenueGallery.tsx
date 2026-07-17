"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

const categories = ["All", "Ceremony Sites", "The Barn", "The Lake", "Amenities", "Events"];

const galleryImages = [
  {
    src: "/images/grove/The_GroveatDeFoorFarms_October_2024-77-scaled.jpg",
    title: "Willow Ceremony Site",
    category: "Ceremony Sites",
  },
  {
    src: "/images/grove/The_GroveatDeFoorFarms_October_2024-48-scaled.jpg",
    title: "The Grove Ceremony Site",
    category: "Ceremony Sites",
  },
  {
    src: "/images/grove/The-Grove-at-Defoor-Farms_2500-90.jpg",
    title: "The Barn Exterior",
    category: "The Barn",
  },
  {
    src: "/images/grove/The-Grove-at-Defoor-Farms_2500-19.jpg",
    title: "Bridal Suite Vanity",
    category: "Amenities",
  },
  {
    src: "/images/grove/The-Grove-at-Defoor-Farms_2500-4Web.jpg",
    title: "Grooms Lodge Lounge",
    category: "Amenities",
  },
  {
    src: "/images/grove/The-Grove-at-Defoor-Farms_2500-50.jpg",
    title: "The 6-Acre Lake",
    category: "The Lake",
  },
  {
    src: "/images/across-the-lake.jpg",
    title: "Lake Dock & Fountain",
    category: "The Lake",
  },
  {
    src: "/images/grove/The-Grove-at-Defoor-Farms_2500-31.jpg",
    title: "Warming Kitchen Facilities",
    category: "Amenities",
  },
  {
    src: "/images/grove/The-Grove-at-Defoor-Farms_2500-10.jpg",
    title: "Wedding Reception",
    category: "Events",
  },
  {
    src: "/images/corporate-event.jpg",
    title: "Corporate Event Setup",
    category: "Events",
  },
];

export default function VenueGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages =
    activeCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredImages.length : null));
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredImages]);

  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredImages.length : null));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : null
    );
  };

  return (
    <div>
      {/* Categories Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setLightboxIndex(null);
            }}
            className={`px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer ${
              activeCategory === category
                ? "bg-gold text-white shadow-md shadow-gold/20"
                : "bg-white text-bark/60 hover:text-bark border border-bark/10"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <motion.div layout className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredImages.map((image, idx) => (
            <motion.div
              key={image.src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="relative group overflow-hidden bg-white shadow-sm ring-1 ring-bark/5 aspect-[4/3] cursor-pointer"
              onClick={() => setLightboxIndex(idx)}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-gold text-[10px] tracking-[0.2em] font-bold uppercase mb-1">
                  {image.category}
                </span>
                <h3 className="font-serif text-white text-xl font-bold flex items-center justify-between">
                  {image.title}
                  <Maximize2 className="w-4 h-4 text-white/60 group-hover:text-gold transition-colors" />
                </h3>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2 cursor-pointer"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-6 text-white/40 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-6 text-white/40 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="max-w-5xl max-h-[80vh] flex flex-col items-center gap-4">
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={filteredImages[lightboxIndex].src}
                alt={filteredImages[lightboxIndex].title}
                className="max-w-full max-h-[75vh] object-contain select-none shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="text-center text-white">
                <span className="text-gold text-xs tracking-widest uppercase font-bold block mb-1">
                  {filteredImages[lightboxIndex].category}
                </span>
                <h2 className="font-serif text-lg sm:text-2xl font-bold">
                  {filteredImages[lightboxIndex].title}
                </h2>
              </div>
            </div>

            <div className="absolute bottom-6 text-white/40 text-xs tracking-widest uppercase font-bold">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
