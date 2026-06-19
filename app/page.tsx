import React from "react";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import IntroSection from "@/components/IntroSection";
import VenueFeatures from "@/components/VenueFeatures";
import EventTypes from "@/components/EventTypes";
import PullQuote from "@/components/PullQuote";
import WeddingSites from "@/components/WeddingSites";
import Amenities from "@/components/Amenities";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <IntroSection />
      <WeddingSites />
      <EventTypes />
      <PullQuote />
      <VenueFeatures />
      <Amenities />
      <Testimonials />
    </>
  );
}
