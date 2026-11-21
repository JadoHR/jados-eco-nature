import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/forms/contact-form";
import { WhatsAppIcon } from "@/components/whatsapp-button";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact JADOS ECO-NATURE INDUSTRIES about orders, wholesale, hotels and corporate gifts.",
};

export default async function ContactPage() {
  const s = await getSettings();
  const wa = whatsappLink(s.whatsappNumber, "Hello JADOS, I would like to get in touch.");
  const isDev = process.env.NODE_ENV !== "production";
  const placeholder = (label: string) => (isDev ? <span className="italic text-muted">[{label} not configured — Admin → Settings]</span> : null);

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="heading-display mt-4 text-4xl sm:text-5xl">Contact us</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Questions about an order, wholesale supply for shops, hotels, lodges and spas, or corporate gifts? We would love to hear from you.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <section className="card p-6 sm:p-8" aria-labelledby="form-heading">
          <h2 id="form-heading" className="font-display text-2xl text-forest">
            Send a message
          </h2>
          <ContactForm />
        </section>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-xl text-forest">Direct contact</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-semibold">Email</dt>
                <dd>{s.contactEmail ? <a className="underline" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a> : placeholder("Email")}</dd>
              </div>
              <div>
                <dt className="font-semibold">Phone</dt>
                <dd>{s.contactPhone ? <a className="underline" href={`tel:${s.contactPhone.replace(/\s/g, "")}`}>{s.contactPhone}</a> : placeholder("Phone")}</dd>
              </div>
              <div>
                <dt className="font-semibold">Address</dt>
                <dd>{s.businessAddress || placeholder("Address")}</dd>
              </div>
              <div>
                <dt className="font-semibold">Hours</dt>
                <dd>{s.operatingHours || placeholder("Opening hours")}</dd>
              </div>
            </dl>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn mt-5 w-full bg-[#1f7a4d] text-white hover:bg-[#186640]">
                <WhatsAppIcon size={18} /> Chat on WhatsApp
              </a>
            )}
          </div>
          <div className="card p-6 text-sm">
            <h2 className="font-display text-lg text-forest">Business enquiries</h2>
            <p className="mt-2 text-muted">
              For wholesale, hospitality and corporate gift orders choose “Wholesale” in the form. Pricing and minimum order quantities are
              shared privately.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
