/**
 * The Em Sherif Café wordmark.
 *
 * It is painted rather than placed: the logo asset is used as a CSS mask and
 * filled with `currentColor`, so the same file gives an ivory mark on the navy
 * header, a navy mark on an ivory card, and the debossed mark on a dish that
 * was never photographed — without a second asset or a re-encode.
 */
export function Wordmark({
  width,
  className = "",
  label,
}: {
  /** Any CSS width; the mark keeps the artwork's 774:471 proportions. */
  width: string;
  className?: string;
  /** Give it a label where it stands in for the café's name, not where it is
   *  decoration beside text that already says so. */
  label?: string;
}) {
  return (
    <span
      className={`wordmark ${className}`}
      style={{ width }}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
