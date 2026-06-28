"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const amenities = [
  {
    title: "Bridal Suite",
    slug: "bridal-suite",
    img: "/images/grove/The-Grove-at-Defoor-Farms_2500-19.jpg",
    description: "Our Bridal Suite is nestled within The Barn featuring three hair & make up vanities with a large open sitting area. The Bridal Suite is also equipped with a kitchen, coffee bar, microwave, refrigerator. Last, but not least, a luxurious bath with free standing tub, large tile shower, double vanity and water closet.",
  },
  {
    title: "Grooms Lodge",
    slug: "grooms-lodge",
    img: "/images/grove/The-Grove-at-Defoor-Farms_2500-4Web.jpg",
    description: "Our Grooms Lodge offers a private space with a living room, game room, pool table, shuffle board, and large screen tv. We are also equipped with a full bath and dressing room. Groomsmen also have access to our patio and pool area.",
  },
  {
    title: "Warming Kitchen",
    slug: null,
    img: "/images/grove/The-Grove-at-Defoor-Farms_2500-31.jpg",
    description: "We want to make your event as memorable as possible. To assist with this we have a warming kitchen equipped with a refrigerator, ice machine, stainless steel work tables, a 3 compartment sink, 2 warming ovens, as well as a 2 compartment sink.",
  },
];

export default function Amenities() {
  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-4">Amenities</p>
          <h2 className="font-serif text-4xl lg:text-5xl text-bark">
            Everything You Need,<br />
            <em>All in One Place</em>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {amenities.map((item, idx) => {
            const cardContent = (
              <div className="bg-white group h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
                <div>
                  <div className="h-64 overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8">
                    <div className="w-8 h-px bg-gold mb-4" />
                    <h3 className="font-serif text-2xl text-bark mb-4 group-hover:text-gold transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-taupe text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
                {item.slug && (
                  <div className="px-8 pb-8">
                    <span className="text-gold text-xs font-bold tracking-widest uppercase border-b border-gold pb-0.5 group-hover:text-gold-dark group-hover:border-gold-dark transition-colors duration-200">
                      Explore Suite Details
                    </span>
                  </div>
                )}
              </div>
            );

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="h-full"
              >
                {item.slug ? (
                  <Link href={`/${item.slug}`} className="block h-full cursor-pointer">
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-taupe text-sm mt-10 italic"
        >
          *The Grove at DeFoor Farm requires all food and drink vendors to be a professional licensed and insured company.
        </motion.p>
      </div>
    </section>
  );
}
