"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "200", label: "Guest Capacity" },
  { value: "6", label: "Acre Lake" },
  { value: "3", label: "Wedding Sites" },
  { value: "7,200", label: "Sq Ft Barn" },
];

export default function StatsBar() {
  return (
    <section className="bg-bark py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center px-6 py-4"
            >
              <span className="font-serif text-4xl lg:text-5xl text-gold leading-none mb-2">
                {stat.value}
              </span>
              <span className="text-white/50 tracking-[0.2em] text-xs uppercase font-bold">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
