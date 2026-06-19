"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-cream min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://thegroveatdefoorfarm.com/wp-content/uploads/2024/10/The-Grove-at-Defoor-Farms_2500-50.jpg"
            alt="The Grove at DeFoor Farm"
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.35)" }}
          />
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-4"
          >
            The Heritage & Vision
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
          >
            Our Story
          </motion.h1>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg text-bark/80 leading-relaxed font-sans"
          >
            <p className="text-xl text-bark font-serif italic mb-8 border-l-4 border-gold pl-6 py-2 leading-relaxed">
              "We built The Grove with a single vision: to create a breathtaking sanctuary where families, friends, and communities could gather to celebrate life's most beautiful moments."
            </p>

            <p className="mb-6">
              Located in the heart of West Georgia, The Grove at DeFoor Farm is a premier family-owned event venue. Spanning acres of pristine, scenic landscape, our venue seamlessly blends rustic charm with modern luxury.
            </p>

            <p className="mb-6">
              The farm itself has deep roots in the community. Originally a working pasture, the land was lovingly reimagined and transformed into a world-class events venue. The center of our property is a historic-inspired 7,200 square foot climate-controlled barn that features high ceilings, exposed beams, and a grand fireplace, all overlooking our peaceful 6-acre lake.
            </p>

            <div className="my-16">
              <div className="relative h-80">
                <img
                  src="/images/Oaklin/IMG_1562-1.jpg"
                  alt="The Oaklin ceremony site at DeFoor Farm"
                  className="w-full h-full object-cover shadow-md"
                />
              </div>
            </div>

            <h3 className="font-serif text-3xl text-bark font-bold mt-12 mb-6">A Family Legacy</h3>
            <p className="mb-6">
              As a family-owned and operated venue, hospitality is at the core of everything we do. We understand that planning a wedding, corporate retreat, or milestone milestone can feel overwhelming. That’s why we pride ourselves on offering personal, hands-on care. From your first private tour of the grounds to the final sweep of the dance floor, our team is dedicated to making your experience seamless and unforgettable.
            </p>

            <h3 className="font-serif text-3xl text-bark font-bold mt-12 mb-6">Spaces Designed for Connection</h3>
            <p className="mb-10">
              Whether you are exchanging vows beneath our grand Oaklin tree, hosting a sunset cocktail hour on the Willow lakefront dock, or dancing the night away in The Barn, each space at DeFoor Farm has been purposefully designed to inspire joy, laughter, and lifelong memories.
            </p>
          </motion.div>

          {/* ── Call to Action ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-20 border-t border-bark/10 pt-16"
          >
            <h2 className="font-serif text-3xl sm:text-4xl text-bark mb-6">Come Experience The Grove</h2>
            <p className="text-taupe text-sm tracking-widest uppercase mb-10">Private tours are available by appointment.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-gold hover:bg-gold-dark text-white text-sm font-bold tracking-widest uppercase px-10 py-5 transition-colors duration-200"
            >
              Schedule a Free Tour <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
