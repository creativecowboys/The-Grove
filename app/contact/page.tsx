"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="bg-cream min-h-screen py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-gold tracking-[0.3em] text-xs font-bold uppercase mb-4">Get In Touch</p>
          <h1 className="font-serif text-4xl lg:text-5xl text-bark mb-4">
            Plan Your <em className="text-gold">Event</em>
          </h1>
          <p className="text-taupe max-w-md mx-auto text-sm leading-relaxed">
            Have questions about pricing, availability, or want to schedule a walk-through? Send us a message!
          </p>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Info Details (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 border border-bark/10 shadow-sm space-y-8">
              <h2 className="font-serif text-3xl text-bark font-bold mb-6">Venue Information</h2>

              {/* Address */}
              <div className="flex gap-4">
                <span className="flex items-center justify-center w-10 h-10 bg-cream text-gold rounded-full flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-bark/50 mb-1">Location</h3>
                  <p className="text-bark/85 text-sm leading-relaxed">
                    844 McBrayer Road<br />
                    Temple, GA 30179
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <span className="flex items-center justify-center w-10 h-10 bg-cream text-gold rounded-full flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-bark/50 mb-1">Phone</h3>
                  <a href="tel:4043046680" className="text-bark/85 text-sm hover:text-gold transition-colors">
                    (404) 304-6680
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <span className="flex items-center justify-center w-10 h-10 bg-cream text-gold rounded-full flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-bark/50 mb-1">Email</h3>
                  <a href="mailto:info@thegroveatdefoorfarm.com" className="text-bark/85 text-sm hover:text-gold transition-colors">
                    info@thegroveatdefoorfarm.com
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <span className="flex items-center justify-center w-10 h-10 bg-cream text-gold rounded-full flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-bark/50 mb-1">Tour Hours</h3>
                  <p className="text-bark/85 text-sm leading-relaxed">
                    Mon - Fri: 9:00 AM - 5:00 PM<br />
                    Sat & Sun: By Appointment Only
                  </p>
                </div>
              </div>
            </div>

            {/* Static Map Placeholder */}
            <div className="relative h-64 border border-bark/10 shadow-sm overflow-hidden bg-white">
              <img
                src="/images/grove/The-Grove-at-Defoor-Farms_2500-50.jpg"
                alt="Venue Location"
                className="w-full h-full object-cover brightness-[0.55]"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 text-white bg-black/30">
                <MapPin className="w-8 h-8 text-gold mb-3 animate-bounce" />
                <h3 className="font-serif text-xl font-bold mb-1">Find Us In Temple</h3>
                <p className="text-xs text-white/75 max-w-xs leading-relaxed">
                  Located in scenic West Georgia, just an hour drive from Atlanta.
                </p>
              </div>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
