import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { venues } from "@/lib/site";

export const metadata: Metadata = {
  title: "Venues",
  description: "Em Sherif restaurants, cafés and delis around the world.",
};

export default function VenuesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Venues"
        title="Around the world"
        intro="Placeholder list — confirm addresses and opening hours before launch."
      />
      <Section>
        <ul className="grid gap-px md:grid-cols-2">
          {venues.map((venue) => (
            <li key={venue.slug} className="bg-burgundy/5 p-8">
              <p className="eyebrow text-burgundy/60">{venue.concept}</p>
              <h2 className="text-burgundy mt-3 text-3xl">{venue.city}</h2>
              <p className="mt-2 text-sm">{venue.address}</p>
              <p className="text-sm">{venue.country}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
