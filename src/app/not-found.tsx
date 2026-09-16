import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export default function NotFound() {
  return (
    <>
      <PageHeader eyebrow="404" title="Page not found" />
      <Section>
        <Link
          href="/"
          className="eyebrow text-burgundy hover:text-gold border-b border-current pb-1 transition-colors"
        >
          Return home
        </Link>
      </Section>
    </>
  );
}
