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
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

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
              {/* Reserve the height of the tallest quote at each breakpoint so the
                  page doesn't jump as the carousel rotates. Measured: narrow phones
                  wrap the longest quote to 3 lines (39px each); from ~480px up it's
                  2 lines; at lg the font grows so 2 lines = 97.6px. */}
              <p className="font-serif text-2xl lg:text-3xl text-white/90 italic leading-relaxed mb-6 min-h-[7.3125rem] min-[480px]:min-h-[4.875rem] lg:min-h-[6.1rem] flex items-center justify-center">
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
              className="relative aspect-video ring-1 ring-white/10 overflow-hidden bg-black"
            >
              {activeVideo === video.id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveVideo(video.id)}
                  aria-label={`Play video: ${video.title}`}
                  className="group absolute inset-0 w-full h-full cursor-pointer"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/10" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex items-center justify-center w-20 h-20 rounded-full bg-black/55 ring-1 ring-white/30 transition-all group-hover:bg-gold group-hover:scale-105">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 ml-1 fill-white" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                  <span className="absolute bottom-0 left-0 right-0 p-5 text-left bg-gradient-to-t from-black/70 to-transparent">
                    <span className="block font-serif text-lg text-white">{video.title}</span>
                  </span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
