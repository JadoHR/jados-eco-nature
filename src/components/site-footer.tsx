import Link from "next/link";
import { Logo } from "./logo";
import type { Settings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";

export function SiteFooter({ settings }: { settings: Settings }) {
  const wa = whatsappLink(settings.whatsappNumber, "Hello JADOS, I have a question.");
  const isDev = process.env.NODE_ENV !== "production";
  const socials = [
    { label: "Instagram", href: settings.instagramUrl },
    { label: "Facebook", href: settings.facebookUrl },
    { label: "LinkedIn", href: settings.linkedinUrl },
  ].filter((s) => s.href);

  return (
    <footer className="mt-24 border-t border-line bg-cream">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted">
            From Nature to Innovation — Creating Value, Preserving Life. A Rwanda-based beekeeping and nature-inspired products venture.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-forest">Shop</h2>
          <ul className="space-y-2 text-sm text-ink/80">
            <li><Link href="/shop" className="hover:text-forest">All products</Link></li>
            <li><Link href="/category/honey" className="hover:text-forest">Honey</Link></li>
            <li><Link href="/category/beeswax-candles" className="hover:text-forest">Beeswax &amp; Candles</Link></li>
            <li><Link href="/category/skincare" className="hover:text-forest">Skincare (in development)</Link></li>
            <li><Link href="/category/gift-sets" className="hover:text-forest">Gift Sets</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-forest">Help &amp; policies</h2>
          <ul className="space-y-2 text-sm text-ink/80">
            <li><Link href="/faq" className="hover:text-forest">FAQ</Link></li>
            <li><Link href="/shipping-returns" className="hover:text-forest">Delivery, returns &amp; refunds</Link></li>
            <li><Link href="/privacy" className="hover:text-forest">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-forest">Terms &amp; conditions</Link></li>
            <li><Link href="/about" className="hover:text-forest">About JADOS</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-forest">Contact</h2>
          <ul className="space-y-2 text-sm text-ink/80">
            {settings.contactEmail ? (
              <li><a href={`mailto:${settings.contactEmail}`} className="hover:text-forest">{settings.contactEmail}</a></li>
            ) : (
              isDev && <li className="italic text-muted">[Email not configured — set in Admin → Settings]</li>
            )}
            {settings.contactPhone ? (
              <li><a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="hover:text-forest">{settings.contactPhone}</a></li>
            ) : (
              isDev && <li className="italic text-muted">[Phone not configured]</li>
            )}
            {wa && (
              <li><a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-forest">WhatsApp us</a></li>
            )}
            {settings.businessAddress && <li>{settings.businessAddress}</li>}
            {settings.operatingHours && <li>{settings.operatingHours}</li>}
            <li><Link href="/contact" className="font-medium text-forest underline decoration-gold underline-offset-4">Contact form</Link></li>
          </ul>
          {socials.length > 0 ? (
            <ul className="mt-4 flex gap-3 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-forest hover:underline">{s.label}</a>
                </li>
              ))}
            </ul>
          ) : (
            isDev && <p className="mt-4 text-xs italic text-muted">[Social links not configured]</p>
          )}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} JADOS ECO-NATURE INDUSTRIES. All rights reserved.</p>
          <p>Product images on this site are concept illustrations until real photography is added.</p>
        </div>
      </div>
    </footer>
  );
}
