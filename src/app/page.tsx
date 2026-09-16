import Link from "next/link";

import { Section } from "@/components/ui/section";
import { siteConfig, venues } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="bg-burgundy text-cream">
        <div className="mx-auto max-w-6xl px-6 py-32 text-center md:py-44">
          <p className="eyebrow text-gold">Beirut · Since 2011</p>
          <h1 className="mt-6 text-5xl leading-tight text-balance md:text-7xl">
            A Lebanese table, set with generosity
          </h1>
          <p className="mx-auto mt-8 max-w-2xl leading-relaxed text-balance">
            {siteConfig.description}
          </p>
          <Link
            href="/reservations"
            className="eyebrow bg-gold text-burgundy hover:bg-gold-light mt-12 inline-block px-10 py-4 transition-colors"
          >
            Book a table
          </Link>
        </div>
      </section>

      <Section eyebrow="Our story" title="Recipes kept, not reinvented">
        <div className="grid gap-8 md:grid-cols-2">
          <p className="leading-relaxed">
            Em Sherif began as a home kitchen in Beirut and grew into a dining room that
            treats Lebanese cooking as something to be served whole — a long set menu,
            brought to the table all at once, the way it would be at home.
          </p>
          <p className="leading-relaxed">
            Every dish follows a recipe written down and kept. Nothing is deconstructed
            and nothing is hurried; the pleasure is in the abundance and in the company
            around the table.
          </p>
        </div>
      </Section>

      <Section
        eyebrow="Venues"
        title="Where to find us"
        className="border-burgundy/10 border-t"
      >
        <ul className="grid gap-px md:grid-cols-2 lg:grid-cols-4">
          {venues.map((venue) => (
            <li key={venue.slug} className="bg-burgundy/5 p-8">
              <p className="eyebrow text-burgundy/60">{venue.concept}</p>
              <p className="font-display text-burgundy mt-3 text-3xl">{venue.city}</p>
              <p className="mt-2 text-sm">{venue.country}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/venues"
          className="eyebrow text-burgundy hover:text-gold mt-10 inline-block border-b border-current pb-1 transition-colors"
        >
          All venues
        </Link>
      </Section>
    </>
  );
}
