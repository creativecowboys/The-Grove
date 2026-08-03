"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "wedding",
    guestCount: "",
    preferredDate: "",
    heardAbout: "social",
    message: "",
    // Conditional fields, carried over from the old WordPress form:
    // bride/groom show for weddings, company shows for corporate events.
    brideName: "",
    groomName: "",
    companyName: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        eventType: "wedding",
        guestCount: "",
        preferredDate: "",
        heardAbout: "social",
        message: "",
        brideName: "",
        groomName: "",
        companyName: "",
      });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-8 text-center shadow-sm">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="font-serif text-2xl font-bold mb-2">Inquiry Received!</h3>
        <p className="text-sm text-emerald-800/80 max-w-sm mx-auto mb-6">
          Thank you for reaching out. A member of our events team will contact you within 24-48 hours to discuss details and schedule your tour.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="bg-gold hover:bg-gold-dark text-white text-xs font-bold tracking-widest uppercase px-6 py-3 transition-colors duration-200"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 lg:p-12 shadow-md border border-bark/10 space-y-6">
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>Something went wrong. Please check your network and try again.</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark placeholder:text-bark/30 focus:outline-none focus:border-gold text-sm transition-colors duration-200"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="(123) 456-7890"
            className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark placeholder:text-bark/30 focus:outline-none focus:border-gold text-sm transition-colors duration-200"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark placeholder:text-bark/30 focus:outline-none focus:border-gold text-sm transition-colors duration-200"
          />
        </div>

        {/* Event Type */}
        <div>
          <label htmlFor="eventType" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
            Event Type
          </label>
          <select
            id="eventType"
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark focus:outline-none focus:border-gold text-sm transition-colors duration-200"
          >
            <option value="wedding">Wedding Ceremony & Reception</option>
            <option value="corporate">Corporate Event</option>
            <option value="graduation">Graduation Party</option>
            <option value="social">Social Celebration / Reunion</option>
            <option value="photoshoot">Photo Shoot</option>
            <option value="other">Other Event Type</option>
          </select>
        </div>
      </div>

      {/* Carried over from the old WordPress form. These were hidden behind the
          event-type dropdown there, which is why they often came in blank —
          always visible here, all optional. */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="brideName" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
            Bride&apos;s Name
          </label>
          <input
            type="text"
            id="brideName"
            name="brideName"
            value={formData.brideName}
            onChange={handleChange}
            placeholder="Bride's Name"
            className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark placeholder:text-bark/30 focus:outline-none focus:border-gold text-sm transition-colors duration-200"
          />
        </div>
        <div>
          <label htmlFor="groomName" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
            Groom&apos;s Name
          </label>
          <input
            type="text"
            id="groomName"
            name="groomName"
            value={formData.groomName}
            onChange={handleChange}
            placeholder="Groom's Name"
            className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark placeholder:text-bark/30 focus:outline-none focus:border-gold text-sm transition-colors duration-200"
          />
        </div>
      </div>

      <div>
        <label htmlFor="companyName" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
          Company Name
        </label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Company Name (for corporate events)"
          className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark placeholder:text-bark/30 focus:outline-none focus:border-gold text-sm transition-colors duration-200"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Preferred Date */}
        <div>
          <label htmlFor="preferredDate" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
            Preferred Date / Season
          </label>
          <input
            type="text"
            id="preferredDate"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            placeholder="e.g. October 2026 or Oct 10, 2026"
            className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark placeholder:text-bark/30 focus:outline-none focus:border-gold text-sm transition-colors duration-200"
          />
        </div>

        {/* Guest Count */}
        <div>
          <label htmlFor="guestCount" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
            Estimated Guest Count
          </label>
          <input
            type="number"
            id="guestCount"
            name="guestCount"
            value={formData.guestCount}
            onChange={handleChange}
            placeholder="e.g. 150"
            className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark placeholder:text-bark/30 focus:outline-none focus:border-gold text-sm transition-colors duration-200"
          />
        </div>
      </div>

      {/* Referral */}
      <div>
        <label htmlFor="heardAbout" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
          How did you hear about us?
        </label>
        <select
          id="heardAbout"
          name="heardAbout"
          value={formData.heardAbout}
          onChange={handleChange}
          className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark focus:outline-none focus:border-gold text-sm transition-colors duration-200"
        >
          <option value="social">Instagram / Facebook</option>
          <option value="search">Google Search</option>
          <option value="referral">Friend / Family Referral</option>
          <option value="vendor">Wedding Vendor Recommendation</option>
          <option value="zola">Zola</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-xs font-bold tracking-widest uppercase text-bark/60 mb-2">
          Message & Details
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your vision for the event..."
          className="w-full bg-cream border border-bark/15 px-4 py-3 text-bark placeholder:text-bark/30 focus:outline-none focus:border-gold text-sm transition-colors duration-200 resize-none"
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-gold hover:bg-gold-dark disabled:bg-gold/50 text-white text-xs font-bold tracking-widest uppercase py-4.5 transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          {status === "loading" ? "Submitting..." : "Send Inquiry"}
        </button>
      </div>
    </form>
  );
}
