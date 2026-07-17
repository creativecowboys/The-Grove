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
        </div>
      </div>
    </footer>
  );
}
