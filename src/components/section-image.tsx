import Image from "next/image";

/**
 * The photograph the printed menu opens a section with, shown at its own
 * proportions rather than cropped to a banner.
 */
export function SectionImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1080}
      height={1576}
      priority
      sizes="(min-width: 768px) 640px, 100vw"
      className="mx-auto h-auto w-full max-w-xl"
    />
  );
}
