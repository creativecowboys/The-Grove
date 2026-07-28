"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-[104px] md:-mt-[116px]">
      {/* Background Video — Vimeo background embed */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "max(100%, 177.78vh)",
            height: "max(56.25vw, 100%)",
            pointerEvents: "none",
          }}
        >
          <iframe
            src="https://player.vimeo.com/video/1193747788?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"
            allow="autoplay; fullscreen"
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Hero background video"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto pt-40 cursor-default select-none">
        {/* Badge */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-3"
        >
          West Georgia's Premiere Event Venue
        </motion.p>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="font-serif text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.02] mb-2 text-shadow"
        >
          The Grove
          <span className="block italic font-normal text-4xl sm:text-5xl lg:text-6xl leading-none mt-1">
            at DeFoor Farm
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-white/80 tracking-[0.25em] text-sm uppercase mb-2"
        >
          Where Shared Memories Are Made
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="w-24 h-px bg-gold mx-auto my-3"
        />

        {/* Event types */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="text-white/60 tracking-[0.2em] text-xs uppercase mb-6"
        >
          Weddings &nbsp;·&nbsp; Corporate &nbsp;·&nbsp; Photo Shoots
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 bg-gold hover:bg-gold-dark text-white text-sm font-bold tracking-widest uppercase px-8 py-4 transition-all duration-300 cursor-pointer"
          >
            Book Free Tour Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-px h-16 bg-gradient-to-b from-white/0 to-gold mx-auto" />
      </motion.div>
    </section>
  );
}
