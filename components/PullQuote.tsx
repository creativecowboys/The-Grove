"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PullQuote() {
  return (
    <section className="relative py-40 overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src="https://thegroveatdefoorfarm.com/wp-content/uploads/2024/10/The-Grove-at-Defoor-Farms_2500-50.jpg"
          alt="The Grove at DeFoor Farm"
          className="w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.35)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          className="w-16 h-px bg-gold mx-auto mb-10"
        />
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="font-serif text-3xl lg:text-5xl text-white leading-snug italic mb-10"
        >
          "All of our guests said it was the most memorable wedding they had ever been to."
        </motion.blockquote>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="w-16 h-px bg-gold mx-auto mb-6" />
          <p className="text-gold tracking-[0.25em] text-xs font-bold uppercase">
            A Grove Bride
          </p>
        </motion.div>
      </div>
    </section>
  );
}
