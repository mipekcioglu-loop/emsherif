import Image from "next/image";

/**
 * The wordmark, cut from the printed menu's cover artwork and recoloured to
 * the brand navy on a transparent background (see README, "Brand assets").
 */
export function Logo({
  width = 210,
  priority = false,
}: {
  width?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/em-sherif-cafe-logo.png"
      alt="Em Sherif Café"
      width={774}
      height={471}
      priority={priority}
      /* Line art on a flat background: Next's re-encode shifts the ivory by a
         step and gains nothing over the already-small palettised PNG. */
      unoptimized
      style={{ width, height: "auto" }}
    />
  );
}
