import { VENUE_ANCHOR } from "@/components/menu-hero";
import { VenueInfo } from "@/components/venue-info";
import { Wordmark } from "@/components/wordmark";
import type { Language } from "@/lib/i18n";
import { dictionaries } from "@/lib/i18n";
import { footerHrefs } from "@/lib/links";

function ExternalMark() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="9"
      height="9"
      aria-hidden="true"
      className="opacity-60"
    >
      <path
        d="M4 8l4-4M4.4 3.9H8.1V7.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Navy chrome at the foot of the page: the wordmark, the venue block — which
 * is also what the ⓘ in the hero opens — and the four links the client asked
 * for. Two of those four and the blog still need their real URLs; see
 * src/lib/links.ts.
 */
export function SiteFooter({ language }: { language: Language }) {
  const dictionary = dictionaries[language];
  const links = [
    { key: "contact", href: footerHrefs.contact, external: false },
    { key: "about", href: footerHrefs.about, external: false },
    { key: "website", href: footerHrefs.website, external: true },
    { key: "blog", href: footerHrefs.blog, external: true },
  ] as const;

  return (
    <footer className="bg-ink text-paper px-5 pt-8.5 pb-6 text-center sm:px-8 sm:pt-11">
      <Wordmark
        width="clamp(112px, 30vw, 132px)"
        className="mx-auto mb-5 sm:mb-6.5"
        label={dictionary.cafeName}
      />

      <VenueInfo language={language} id={VENUE_ANCHOR} />

      <nav
        aria-label={dictionary.cafeName}
        className="border-paper/14 mt-5.5 grid grid-cols-2 border-y sm:mt-6.5 sm:flex sm:flex-wrap sm:justify-center sm:border-0"
      >
        {links.map((link, index) => (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noopener"
            className={`footer-link-label text-paper/70 hover:text-paper relative inline-flex items-center justify-center gap-1.5 px-1.5 py-2.5 transition-colors sm:px-5.5 sm:py-1.5 sm:before:absolute sm:before:start-0 sm:before:top-1/2 sm:before:h-3.5 sm:before:w-px sm:before:-translate-y-1/2 sm:before:bg-[color-mix(in_srgb,var(--color-paper)_22%,transparent)] sm:before:content-[''] sm:first:before:hidden ${
              index < 2 ? "border-paper/14 border-b sm:border-0" : ""
            } ${index % 2 === 0 ? "border-paper/14 border-e sm:border-0" : ""}`}
          >
            {dictionary.footerLinks[link.key]}
            {link.external ? <ExternalMark /> : null}
          </a>
        ))}
      </nav>

      <div className="bg-paper/14 mt-6.5 mb-4 h-px" />

      <p className="eyebrow text-paper/45">
        © {new Date().getFullYear()} {dictionary.cafeName} · {dictionary.city}
      </p>
    </footer>
  );
}
