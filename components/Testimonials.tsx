"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  { text: "All of our guests said it was the most memorable wedding they had been to.", author: "A Grove Bride" },
  { text: "Amazing! Beautiful! That's all we heard all night long.", author: "A Grove Couple" },
  { text: "One of the most memorable moments of our wedding was definitely the sunset over the lake.", author: "A Grove Bride" },
  { text: "It was just absolutely flawless. We couldn't have asked for more.", author: "A Grove Couple" },
  { text: "The owners are so nice — they help you with anything and everything.", author: "A Grove Guest" },
  { text: "I didn't hear one bad comment about the place. Everyone was so happy.", author: "A Grove Bride" },
];

const videos = [
  { id: "Fky-TpVZhxM", title: "The Grove at DeFoor Farm Testimony" },
  { id: "PH4Htda5wPk", title: "The Huff's Dream Venue" },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 lg:py-32 bg-bark">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-4">Testimonials</p>
          <h2 className="font-serif text-4xl lg:text-5xl text-white">
            What Our Clients<br />
            <em className="text-gold">Are Saying</em>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </motion.div>

        {/* Rotating single quote */}
        <div className="max-w-3xl mx-auto text-center mb-20 min-h-[180px] flex flex-col items-center justify-center">
          <div className="text-gold font-serif text-6xl leading-none mb-4 opacity-40">"</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="font-serif text-2xl lg:text-3xl text-white/90 italic leading-relaxed mb-6">
                {quotes[current].text}
              </p>
              <p className="text-gold tracking-[0.25em] text-xs font-bold uppercase">
                — {quotes[current].author}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="flex gap-2 mt-8">
            {quotes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === current ? "bg-gold w-6" : "bg-white/30"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Videos */}
        <div className="grid md:grid-cols-2 gap-8">
          {videos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative aspect-video ring-1 ring-white/10"
            >
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
