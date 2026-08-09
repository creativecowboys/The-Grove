"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/** Renders nothing; records the visitor's first-touch source once per visit. */
export default function AttributionTracker() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
