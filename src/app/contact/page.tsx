import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Em Sherif.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        intro="Placeholder — add press, events and general enquiry details."
      />
      <Section>
        <a
          href={siteConfig.social.instagram}
          className="eyebrow text-burgundy hover:text-gold border-b border-current pb-1 transition-colors"
          rel="noreferrer"
          target="_blank"
        >
          Instagram
        </a>
      </Section>
    </>
  );
}
