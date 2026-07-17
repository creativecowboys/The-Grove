"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Instagram, Facebook } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Bridal Suite", href: "/bridal-suite" },
  { label: "Grooms Lodge", href: "/grooms-lodge" },
  { label: "Oaklin", href: "/oaklin" },
  { label: "Willow", href: "/willow" },
  { label: "The Grove", href: "/the-grove" },
  { label: "Chapel", href: "/chapel" },
  { label: "The Barn", href: "/the-barn" },
  { label: "The Lake", href: "/the-lake" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-cream transition-shadow duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      {/* ── Row 1: Hamburger | Logo | Inquire ── */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 items-center py-7 border-b border-bark/10">
        {/* Left — social icons (desktop) / hamburger (mobile) */}
        <div className="flex items-center gap-4">
          {/* Social — desktop only */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://www.instagram.com/thegroveatdefoorfarm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bark/40 hover:text-bark transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/thegroveatdefoorfarm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bark/40 hover:text-bark transition-colors duration-200"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center gap-2 text-bark/60 hover:text-bark transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="text-xs tracking-widest uppercase font-medium">
              {open ? "Close" : "Menu"}
            </span>
          </button>
        </div>

        {/* Center — logo */}
        <div className="flex justify-center">
          <Link href="/" className="mt-3">
            <img
              src="/images/logo-dark.webp"
              alt="The Grove at DeFoor Farm"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Right — Inquire */}
        <div className="flex justify-end">
          <Link
            href="/contact"
            className="text-xs tracking-widest uppercase font-bold text-bark/70 hover:text-bark transition-colors duration-200 hidden md:inline-flex items-center gap-3"
          >
            Inquire
          </Link>
          {/* Mobile: inquire button */}
          <Link
            href="/contact"
            className="md:hidden text-xs font-bold tracking-widest uppercase text-bark/70 hover:text-bark transition-colors"
          >
            Inquire
          </Link>
        </div>
      </div>

      {/* ── Row 2: Horizontal venue nav (desktop) ── */}
      <nav className="hidden md:flex items-center justify-center gap-7 px-6 py-3 overflow-x-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`whitespace-nowrap text-xs tracking-wider transition-colors duration-200 ${
                isActive
                  ? "font-bold text-bark border-b border-gold pb-0.5"
                  : "font-normal text-bark/80 hover:text-bark"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Mobile slide-down menu ── */}
      <div
        className={`md:hidden bg-cream border-t border-bark/10 transition-all duration-300 overflow-hidden ${
          open ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-6 gap-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-sm tracking-wider border-b border-bark/10 pb-4 transition-colors duration-200 ${
                  isActive ? "text-gold font-bold" : "text-bark/70 hover:text-bark"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center bg-gold hover:bg-gold-dark text-white text-xs font-bold tracking-widest uppercase px-6 py-3 transition-all duration-200"
          >
            Book a Tour
          </Link>
        </nav>
      </div>
    </header>
  );
}
