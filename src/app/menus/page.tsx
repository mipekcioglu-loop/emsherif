import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Menus",
  description: "The Em Sherif set menu and seasonal selections.",
};

export default function MenusPage() {
  return (
    <>
      <PageHeader
        eyebrow="Menus"
        title="The set menu"
        intro="Placeholder copy — replace with the current menu, per venue."
      />
      <Section>
        <p className="max-w-2xl leading-relaxed">
          Menu data will be modelled in <code>src/lib/</code> (or loaded from the CMS) so
          each venue can publish its own courses and pricing.
        </p>
      </Section>
    </>
  );
}
