import Image from "next/image";
import Link from "next/link";

/**
 * Brand lockup: placeholder bee/flower/leaf mark + clean "JADOS ECO-NATURE INDUSTRIES" wordmark.
 * Replace /public/brand/jados-mark.svg with the official logo symbol when it is supplied
 * (keep it square so proportions are preserved).
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="JADOS ECO-NATURE INDUSTRIES — home">
      <Image src="/brand/jados-mark.svg" alt="" width={44} height={44} className="h-10 w-10 sm:h-11 sm:w-11" priority unoptimized />
      <span className="whitespace-nowrap leading-none">
        <span className="block font-display text-lg font-semibold tracking-[0.12em] text-forest sm:text-xl">JADOS</span>
        {!compact && (
          <span className="block text-[0.6rem] font-semibold tracking-[0.22em] text-sage sm:text-[0.65rem]">
            ECO-NATURE INDUSTRIES
          </span>
        )}
      </span>
    </Link>
  );
}
