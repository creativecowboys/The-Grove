import React from "react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1a1814] text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <img
            src="/images/grove/TheGroveLogoWhite-1024x183.png"
            alt="The Grove at DeFoor Farm"
            className="h-12 w-auto mb-8 opacity-90"
          />

          <div className="w-16 h-px bg-gold mb-8" />

          {/* Nav */}
          <nav className="flex items-center gap-8 mb-10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-white/50 hover:text-gold tracking-widest text-xs font-bold uppercase transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-white/30 text-xs tracking-wider">
            © {new Date().getFullYear()} The Grove at DeFoor Farm. All rights reserved.
          </p>

          {/* Powered by Creative Cowboys */}
          <a
            href="https://creativecowboys.co"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 flex flex-col items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-3 text-gold/80 group-hover:text-gold text-[10px] tracking-[0.28em] uppercase font-bold transition-colors duration-300">
              <span className="h-px w-6 bg-gold/40 group-hover:bg-gold/70 transition-colors duration-300" />
              Powered by
              <span className="h-px w-6 bg-gold/40 group-hover:bg-gold/70 transition-colors duration-300" />
            </span>
            <img
              src="/images/grove/creative-cowboys-white.png"
              alt="Creative Cowboys"
              className="h-12 w-auto opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
