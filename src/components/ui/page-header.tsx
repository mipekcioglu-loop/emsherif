type PageHeaderProps = {
  eyebrow: string;
  title: string;
  intro?: string;
};

/** Burgundy banner used at the top of every interior page. */
export function PageHeader({ eyebrow, title, intro }: PageHeaderProps) {
  return (
    <div className="bg-burgundy text-cream">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h1 className="mt-5 text-5xl md:text-6xl">{title}</h1>
        {intro ? (
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-balance">{intro}</p>
        ) : null}
      </div>
    </div>
  );
}
