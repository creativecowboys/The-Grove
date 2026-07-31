import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import legacy from "@/lib/legacy-content.json";

type Block =
  | { type: "h1" | "h2" | "h3" | "h4" | "p" | "blockquote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "img"; src: string; alt?: string; missing?: boolean };

type Entry = {
  kind: "page" | "post";
  slug: string;
  title: string;
  url: string;
  date: string;
  seoTitle: string;
  seoDescription: string;
  words: number;
  blocks: Block[];
};

const content = legacy as unknown as Record<string, Entry>;

export function getLegacyEntry(slug: string): Entry | undefined {
  return content[slug];
}

export const legacySlugs = Object.keys(content);

/** Renders copy carried over from the previous WordPress site, word-for-word. */
export default function LegacyPage({ slug }: { slug: string }) {
  const entry = getLegacyEntry(slug);
  if (!entry) return null;

  // The first h1 becomes the hero; everything after flows as the article body.
  const firstH1 = entry.blocks.findIndex((b) => b.type === "h1");
  const heroText =
    firstH1 >= 0 ? (entry.blocks[firstH1] as { text: string }).text : entry.title;
  const body = entry.blocks.filter((_, i) => i !== firstH1);

  const heroLines = heroText.split("\n").filter(Boolean);

  return (
    <div className="bg-cream min-h-screen">
      {/* Title band */}
      <section className="bg-[#2a2620] py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gold-light tracking-[0.3em] text-xs font-bold uppercase mb-4 text-shadow-sm">
            {entry.kind === "post" ? "From the Journal" : "Wedding Venue"}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-bold leading-tight">
            {heroLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <div className="w-16 h-px bg-gold-light mx-auto mt-6" />
        </div>
      </section>

      {/* Body */}
      <section className="py-16 lg:py-24 bg-white">
        <article className="max-w-3xl mx-auto px-6 text-bark/85 leading-relaxed">
          {body.map((b, i) => {
            if (b.type === "img") {
              if (b.missing) return null;
              return (
                <figure key={i} className="my-10">
                  <img
                    src={b.src}
                    alt={b.alt || entry.title}
                    loading="lazy"
                    className="w-full h-auto border border-bark/10 shadow-sm"
                  />
                </figure>
              );
            }
            if (b.type === "ul") {
              return (
                <ul key={i} className="my-6 space-y-3 list-none">
                  {b.items.map((item, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="text-gold mt-1.5 flex-shrink-0">&#8226;</span>
                      <span className="whitespace-pre-line">{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            const lines = b.text.split("\n").filter(Boolean);
            if (b.type === "h2") {
              return (
                <h2
                  key={i}
                  className="font-serif text-2xl sm:text-3xl text-bark font-bold mt-12 mb-4"
                >
                  {lines.map((l, j) => (
                    <span key={j} className="block">
                      {l}
                    </span>
                  ))}
                </h2>
              );
            }
            if (b.type === "h3" || b.type === "h4") {
              return (
                <h3 key={i} className="font-serif text-xl sm:text-2xl text-bark font-bold mt-9 mb-3">
                  {b.text}
                </h3>
              );
            }
            if (b.type === "blockquote") {
              return (
                <blockquote
                  key={i}
                  className="my-8 border-l-4 border-gold pl-6 py-2 font-serif italic text-lg text-bark"
                >
                  {b.text}
                </blockquote>
              );
            }
            return (
              <p key={i} className="mb-5 whitespace-pre-line">
                {b.text}
              </p>
            );
          })}

          {/* CTA */}
          <div className="mt-16 pt-12 border-t border-bark/10 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl text-bark mb-4">
              Come Experience The Grove
            </h2>
            <p className="text-taupe text-sm tracking-widest uppercase mb-8">
              Private tours are available by appointment.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-gold hover:bg-gold-dark text-white text-sm font-bold tracking-widest uppercase px-10 py-5 transition-colors duration-200"
            >
              Schedule a Free Tour <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
