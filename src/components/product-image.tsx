import Image from "next/image";

/** Optimises local raster images; SVG and external URLs are served as-is. */
export function ProductImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) {
    return (
      <div className={`grid place-items-center bg-paper text-xs text-muted ${className}`} role="img" aria-label="No image available">
        No image yet
      </div>
    );
  }
  const unoptimized = src.endsWith(".svg") || src.startsWith("http");
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={unoptimized} className="object-cover" />
    </div>
  );
}
