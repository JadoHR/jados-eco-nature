import { CartProvider } from "@/components/cart/cart-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-button";
import { getSettings } from "@/lib/settings";
import { storeMode } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const demo = storeMode() === "demo";

  return (
    <CartProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-on-forest">
        Skip to content
      </a>
      {demo && (
        <div className="bg-[#7a4b12] px-4 py-1.5 text-center text-xs font-medium text-white">
          Demo store — products, prices and stock are placeholders. Orders placed here are test orders.
        </div>
      )}
      {settings.announcement && (
        <div className="bg-forest px-4 py-2 text-center text-sm text-on-forest" role="status">
          {settings.announcement}
        </div>
      )}
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsAppFloat number={settings.whatsappNumber} />
    </CartProvider>
  );
}
