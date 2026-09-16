import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Reservations",
  description: "Reserve a table at Em Sherif.",
};

export default function ReservationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="Book a table"
        intro="Placeholder — wire up to the chosen booking provider."
      />
      <Section>
        <p className="max-w-2xl leading-relaxed">
          No booking provider is connected yet. Once one is chosen (SevenRooms, OpenTable,
          Quandoo or an in-house form), the integration belongs here and its credentials
          in <code>.env</code>.
        </p>
      </Section>
    </>
  );
}
