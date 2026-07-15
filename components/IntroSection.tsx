"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export default function IntroSection() {
  const [imgHovered, setImgHovered] = useState(false);
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <section ref={sectionRef} className="py-24 lg:py-36 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* ── Heading ── */}
        <div className="text-center mb-16">
          <p className="tracking-[0.35em] text-xs font-bold uppercase text-bark/50 mb-5">
            The Grove at DeFoor Farm
          </p>
          <h2
            className="font-serif font-bold text-bark"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", letterSpacing: "0.14em" }}
          >
            Where Shared Memories Are Made
          </h2>
          <div className="mx-auto mt-5 h-px w-20 bg-gold" />
        </div>

        {/* ── Image + divider + text ── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Circular image */}
          <motion.div
            style={{ y: imgY }}
            className="flex-shrink-0 relative"
            onMouseEnter={() => setImgHovered(true)}
            onMouseLeave={() => setImgHovered(false)}
          >
            {/* Decorative rings */}
            <div
              className="absolute rounded-full border border-gold/25 inset-0 transition-transform duration-700 ease-in-out"
              style={{ transform: `scale(1.08) rotate(${imgHovered ? "12deg" : "0deg"})` }}
            />
            <div
              className="absolute rounded-full border border-bark/10 inset-0 transition-transform duration-700 ease-in-out"
              style={{ transform: `scale(1.15) rotate(${imgHovered ? "-8deg" : "0deg"})` }}
            />
            <div
              className="rounded-full overflow-hidden shadow-xl cursor-pointer"
              style={{ width: "300px", height: "300px" }}
            >
              <img
                src="/images/The-Grove-at-Defoor-Farms_2500-44.jpg"
                alt="A couple at The Grove at DeFoor Farm"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out"
                style={{ transform: imgHovered ? "scale(1.08)" : "scale(1)" }}
              />
            </div>
          </motion.div>

          {/* Gradient divider */}
          <div
            className="hidden lg:block flex-shrink-0 w-px self-stretch"
            style={{
              background: "linear-gradient(to bottom, transparent, #C8A97E 25%, #C8A97E 75%, transparent)",
              minHeight: "260px",
            }}
          />

          {/* Text */}
          <div className="flex-1">
            <p
              className="text-bark/70 leading-loose text-[1.05rem] mb-8"
              style={{ textAlign: "justify" }}
            >
              <span
                className="font-serif font-bold text-bark float-left mr-2"
                style={{ fontSize: "4.5rem", lineHeight: "0.82", marginTop: "4px" }}
              >
                N
              </span>
              estled in the countryside of West Georgia, The Grove at DeFoor Farm is a welcoming
              setting for weddings and corporate events — a premier venue where southern charm
              meets modern polish. With four distinct wedding sites set among the trees, the
              property offers a beautiful backdrop for exchanging vows. At the heart of it all is a
              7,200 square foot barn, a beautifully finished space made for receptions and
              corporate gatherings alike. A quiet 6-acre lake with two docks rounds out the
              grounds, offering a peaceful spot for guests and a favorite setting for photos.
              Whether you&apos;re planning a wedding or a corporate event, The Grove is ready to
              host it.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 clear-both pt-2">
              <Link
                href="/about"
                className="inline-flex items-center bg-bark text-white text-xs font-bold tracking-[0.2em] uppercase px-9 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-bark/20"
              >
                About Us
              </Link>
              <a
                href="https://www.youtube.com/watch?v=L3lOQTmOvv0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-gold text-white text-xs font-bold tracking-[0.2em] uppercase px-9 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/30"
              >
                Watch Video
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
