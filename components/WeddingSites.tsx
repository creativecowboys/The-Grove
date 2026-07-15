"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const sites = [
  {
    name: "Oaklin",
    slug: "oaklin",
    img: "/images/Oaklin/oaklin-night-square.jpg",
    position: "object-center",
    description: "Settled under a beautiful aged oak tree, this wedding site is a perfect place to unite together in a marriage as strong and resilient as the oak itself.",
  },
  {
    name: "Willow",
    slug: "willow",
    img: "/images/Willow/willow-2.jpg",
    position: "object-center",
    description: 'This wedding site is settled directly beside the lake, edged in by a beautiful stone sea wall. The willow tree is full of symbolism such as hope and safety. Say "I do" at our Willow site, declaring to be a source of hope and safety for your life-long partner.',
  },
  {
    name: "The Grove",
    slug: "the-grove",
    img: "/images/grove-site.jpg",
    position: "object-center",
    description: "Surrounded by large trees, a flowing brook with small waterfalls, and a view of the lake, The Grove is undoubtedly one of our favorite sites. We are sure it will become one of yours as well.",
  },
];

export default function WeddingSites() {
  return (
    <section className="bg-[#2a2620] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-4">Wedding Sites</p>
          <h2 className="font-serif text-4xl lg:text-5xl text-white mb-4">
            Our Venue Features<br />
            <em className="text-gold">4 Unique Wedding Sites</em>
          </h2>

          {/* Site names */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {[...sites.map((site) => site.name), "Chapel"].map((name, idx, names) => (
              <React.Fragment key={name}>
                <span className="tracking-widest text-sm uppercase font-bold text-white/40">
                  {name}
                </span>
                {idx < names.length - 1 && <span className="text-white/20">·</span>}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Stacked sites with alternating layout */}
        <div className="space-y-24 lg:space-y-32">
          {sites.map((site, idx) => {
            const reversed = idx % 2 === 1;

            return (
              <motion.div
                key={site.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
              >
                {/* Image */}
                <div className={`relative ${reversed ? "lg:order-2" : ""}`}>
                  <Link href={`/${site.slug}`}>
                    <div className="overflow-hidden cursor-pointer group">
                      <img
                        src={site.img}
                        alt={site.name}
                        className={`w-full h-[480px] object-cover ${site.position} transition-transform duration-500 group-hover:scale-105`}
                      />
                    </div>
                  </Link>
                  <div
                    className={`absolute -bottom-4 ${
                      reversed ? "-left-4" : "-right-4"
                    } w-full h-full border border-gold/20 -z-10`}
                  />
                </div>

                {/* Text */}
                <div className={`text-white ${reversed ? "lg:order-1" : ""}`}>
                  <Link href={`/${site.slug}`}>
                    <h3 className="font-serif text-4xl lg:text-5xl mb-6 hover:text-gold transition-colors duration-200 inline-block cursor-pointer">
                      {site.name}
                    </h3>
                  </Link>
                  <div className="w-12 h-px bg-gold mb-8" />
                  <p className="text-white/60 leading-relaxed text-lg mb-10">{site.description}</p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/contact"
                      className="inline-flex items-center bg-gold hover:bg-gold-dark text-white text-sm font-bold tracking-widest uppercase px-8 py-4 transition-colors duration-200"
                    >
                      Inquire About This Site
                    </Link>
                    <Link
                      href={`/${site.slug}`}
                      className="inline-flex items-center border border-white/25 hover:border-gold text-white hover:text-gold text-sm font-bold tracking-widest uppercase px-8 py-4 transition-colors duration-200"
                    >
                      View Site Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
