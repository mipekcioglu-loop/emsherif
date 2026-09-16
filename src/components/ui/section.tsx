import type { ReactNode } from "react";

type SectionProps = {
  eyebrow?: string;
  title?: string;
  children?: ReactNode;
  className?: string;
};

/** Standard page section: constrained width, consistent vertical rhythm. */
export function Section({ eyebrow, title, children, className = "" }: SectionProps) {
  return (
    <section className={`mx-auto max-w-6xl px-6 py-20 ${className}`}>
      {eyebrow ? <p className="eyebrow text-burgundy/60">{eyebrow}</p> : null}
      {title ? (
        <h2 className="text-burgundy mt-4 text-4xl md:text-5xl">{title}</h2>
      ) : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}
