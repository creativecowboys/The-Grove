"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { markSeen, seenRecently } from "@/lib/video-popup";

// Files in public/video carry a date in the name: when the spot changes, use a
// new name so no browser or CDN cache can serve the old one.
const VIDEO_SRC = "/video/grove-spot-20261102.mp4";
const POSTER_SRC = "/video/grove-spot-poster-20261102.jpg";
const OPEN_DELAY_MS = 1500;
const BOOKING_LINE_ID = "grove-video-booking";

const storage = () => window.localStorage;

// Backstop for blocked storage: a visitor who cannot be remembered still only
// sees it once per page load, not each time they come back to the homepage.
let shownThisPageLoad = false;

function stopVideo(video: HTMLVideoElement) {
  video.pause();
  // Dropping the source also cancels whatever is still downloading.
  video.removeAttribute("src");
  video.load();
}

function VideoDialog({ onClosed }: { onClosed: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!dialog || !video) return;

    shownThisPageLoad = true;
    markSeen(storage, Date.now());

    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    if (!dialog.open) dialog.showModal();
    dialog.focus();

    // The file is only requested from here, once the popup is open.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    video.preload = reduceMotion ? "metadata" : "auto";
    video.src = VIDEO_SRC;
    if (!reduceMotion) {
      // Browsers only allow autoplay when muted. If it is still refused (iOS
      // Low Power Mode), the poster and the controls are left in place.
      video.muted = true;
      video.play().catch(() => {});
    }

    return () => {
      stopVideo(video);
      if (dialog.open) dialog.close();
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, []);

  const close = () => dialogRef.current?.close();

  // X, Esc, the backdrop and the link all end here through the dialog's close event.
  const handleClosed = () => {
    if (videoRef.current) stopVideo(videoRef.current);
    markSeen(storage, Date.now());
    onClosed();
  };

  const trapTab = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const active = document.activeElement;
    if (event.shiftKey && (active === closeRef.current || active === dialogRef.current)) {
      event.preventDefault();
      linkRef.current?.focus();
    } else if (!event.shiftKey && active === linkRef.current) {
      event.preventDefault();
      closeRef.current?.focus();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-label="Video from The Grove at DeFoor Farm"
      aria-describedby={BOOKING_LINE_ID}
      onClose={handleClosed}
      onKeyDown={trapTab}
      onClick={(event) => {
        // The dialog fills the screen, so a click that lands on it directly is
        // a click on the dark area around the video.
        if (event.target === event.currentTarget) close();
      }}
      className="grove-popup fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center overflow-y-auto overscroll-contain border-0 bg-black/85 px-4 pb-4 pt-14 outline-none open:flex"
    >
      <div className="grove-popup-panel relative shrink-0">
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close video"
          className="absolute -top-12 right-0 flex h-11 w-11 cursor-pointer items-center justify-center text-white transition-colors hover:text-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X className="h-7 w-7" aria-hidden="true" />
        </button>

        <video
          ref={videoRef}
          poster={POSTER_SRC}
          controls
          playsInline
          aria-label="The Grove at DeFoor Farm"
          className="block aspect-video w-full bg-black"
        />

        <div className="flex flex-col items-center justify-center gap-3 bg-cream px-4 py-4 text-center sm:flex-row sm:gap-8 short:flex-row short:gap-4 short:px-2 short:py-2">
          <p id={BOOKING_LINE_ID} className="font-serif text-2xl italic leading-tight text-bark lining-nums sm:text-3xl short:text-xl">
            Booking for 2027/2028
          </p>
          <Link
            ref={linkRef}
            href="/contact"
            onClick={close}
            className="inline-flex min-h-11 shrink-0 items-center justify-center bg-gold-dark px-8 text-sm font-bold tracking-widest text-white transition-colors hover:bg-bark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark short:px-5"
          >
            Contact us
          </Link>
        </div>
      </div>
    </dialog>
  );
}

export default function VideoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (shownThisPageLoad || seenRecently(storage, Date.now())) return;

    // Wait for the page itself, then a beat more, so this never competes with
    // first paint. Leaving the homepage first cancels it.
    let timer: number | undefined;
    const arm = () => {
      timer = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", arm);
    };
  }, []);

  if (!open) return null;
  return <VideoDialog onClosed={() => setOpen(false)} />;
}
