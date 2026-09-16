import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "How Em Sherif grew from a Beirut home kitchen into a Lebanese fine-dining house.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="From a home kitchen in Beirut"
        intro="Placeholder copy — replace with the approved brand narrative."
      />
      <Section>
        <p className="max-w-2xl leading-relaxed">
          This page is scaffolded and ready for the final story text, founder portrait and
          archive photography.
        </p>
      </Section>
    </>
  );
}
