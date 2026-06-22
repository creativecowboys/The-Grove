"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    title: "The Barn",
    slug: "the-barn",
    img: "https://thegroveatdefoorfarm.com/wp-content/uploads/2024/10/The-Grove-at-Defoor-Farms_2500-90.jpg",
    description: "7,200 sq ft of conditioned or open air space overlooking the lake, with tables and chairs for up to 200 guests. This space also features a fireplace and TV.",
    detail: "Up to 200 Guests · 7,200 Sq Ft · Fireplace & TV",
  },
  {
    title: "The Lake",
    slug: "the-lake",
    img: "https://thegroveatdefoorfarm.com/wp-content/uploads/2024/10/The-Grove-at-Defoor-Farms_2500-50.jpg",
    description: "We have a beautiful 6 acre lake with two docks. The first dock features a covered seating area while the second dock features a swing. We also have several seating areas around the lake to view the beautiful lit fountain.",
    detail: "6 Acres · Two Docks · Lit Fountain",
  },
];

export default function VenueFeatures() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-4">Wedding Sites</p>
          <h2 className="font-serif text-4xl lg:text-5xl text-bark">
            Our Venue Features<br />
            <em>3 Unique Wedding Sites</em>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </motion.div>

        <div className="space-y-20">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image — alternate sides */}
              <div className={`relative ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                <Link href={`/${feature.slug}`}>
                  <div className="overflow-hidden cursor-pointer group">
                    <img
                      src={feature.img}
                      alt={feature.title}
                      className="w-full h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div
                  className={`absolute -bottom-4 ${
                    idx % 2 === 0 ? "-right-4" : "-left-4"
                  } w-full h-full border border-gold/30 -z-10`}
                />
              </div>

              {/* Text */}
              <div className={idx % 2 === 1 ? "lg:order-1" : ""}>
                <h3 className="font-serif text-4xl text-bark mb-4">{feature.title}</h3>
                <p className="text-gold tracking-widest text-xs uppercase font-bold mb-6">
                  {feature.detail}
                </p>
                <div className="w-12 h-px bg-gold mb-8" />
                <p className="text-taupe leading-relaxed text-lg mb-8">{feature.description}</p>
                <Link
                  href={`/${feature.slug}`}
                  className="inline-flex items-center text-xs font-bold tracking-widest uppercase border-b border-gold pb-1 text-gold hover:text-gold-dark hover:border-gold-dark transition-colors duration-200"
                >
                  Explore Space Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
