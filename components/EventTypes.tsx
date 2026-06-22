"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const events = [
  {
    title: "Weddings",
    img: "https://thegroveatdefoorfarm.com/wp-content/uploads/2024/10/The_GroveatDeFoorFarms_October_2024-64-scaled.jpg",
    description: "Your wedding day should be as special as the person you are choosing to spend the rest of your life with. With our 3 beautiful wedding sights, as well as grooms lodge and bridal suite, we have everything you need to make your special day perfect.",
  },
  {
    title: "Corporate Events",
    img: "https://thegroveatdefoorfarm.com/wp-content/uploads/2024/10/The-Grove-at-Defoor-Farms_2500-3.jpg",
    description: "Whether you are hosting a fundraiser, revealing the next phase of your company, or simply celebrating your employees. We offer the perfect opportunity for team building, including areas for a cookout and relaxing. As well as fishing our fully stocked lake.",
  },
  {
    title: "Graduations",
    img: "/images/Graduation.png",
    description: "Is someone close to you wrapping up high school, college, or a special training? Let us help you celebrate their hard work!",
  },
];

export default function EventTypes() {
  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-4">Celebrate With Us</p>
          <h2 className="font-serif text-4xl lg:text-5xl text-bark">
            Beauty and Nature<br />
            <em>All in One Place</em>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </motion.div>

        {/* Editorial portrait cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event, idx) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="group relative overflow-hidden"
              style={{ height: "520px" }}
            >
              {/* Image */}
              <img
                src={event.img}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient overlay — stronger at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Text pinned to bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="w-8 h-px bg-gold mb-4" />
                <h3 className="font-serif text-3xl text-white mb-3">{event.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-xs">{event.description}</p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-gold text-xs font-bold tracking-widest uppercase hover:gap-3 transition-all duration-200"
                >
                  Inquire <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-gold hover:bg-gold-dark text-white text-sm font-bold tracking-widest uppercase px-10 py-4 transition-colors duration-200"
          >
            Book Now <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
