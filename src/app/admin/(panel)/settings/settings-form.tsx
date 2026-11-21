"use client";

import { useActionState } from "react";
import { saveSettingsAction, type ActionState } from "../../actions";
import { keepValuesSubmit } from "@/components/admin/use-keep-values";
import type { PaymentMethod } from "@/lib/settings";

type S = {
  storeName: string;
  currency: string;
  contactPhone: string;
  whatsappNumber: string;
  contactEmail: string;
  businessAddress: string;
  operatingHours: string;
  announcement: string;
  pickupEnabled: boolean;
  pickupInstructions: string;
  lowStockThreshold: number;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  paymentMethods: PaymentMethod[];
};

export function SettingsForm({ settings }: { settings: S }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveSettingsAction, {});
  const f = state.fields ?? {};
  const methods = [...settings.paymentMethods, { id: "", label: "", instructions: "", enabled: true }].slice(0, 6);

  const text = (name: keyof S, label: string, hint?: string, type = "text") => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} className="input" defaultValue={String(settings[name] ?? "")} />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {f[name] && <p className="field-error">{f[name]}</p>}
    </div>
  );

  return (
    <form action={action} onSubmit={keepValuesSubmit(action)} className="space-y-6">
      <section className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-semibold text-forest sm:col-span-2">Business &amp; contact</h2>
        {text("storeName", "Store name")}
        {text("currency", "Currency (ISO code)", "RWF for Rwanda. Changing this does not convert existing prices.")}
        {text("contactPhone", "Contact phone", "Shown in the footer and contact page.")}
        {text("whatsappNumber", "WhatsApp number", "International format, e.g. +2507XXXXXXXX. Empty = WhatsApp buttons hidden.")}
        {text("contactEmail", "Contact email", undefined, "email")}
        {text("operatingHours", "Operating hours", "e.g. Mon–Sat, 8:00–18:00")}
        <div className="sm:col-span-2">{text("businessAddress", "Business address")}</div>
        <div className="sm:col-span-2">{text("announcement", "Announcement strip", "Short message at the top of every page. Empty = hidden. Do not announce promotions you are not running.")}</div>
        {text("instagramUrl", "Instagram URL")}
        {text("facebookUrl", "Facebook URL")}
        {text("linkedinUrl", "LinkedIn URL")}
        {text("lowStockThreshold", "Low-stock alert threshold", undefined, "number")}
      </section>

      <section className="card grid gap-4 p-6">
        <h2 className="font-semibold text-forest">Pickup</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="pickupEnabled" defaultChecked={settings.pickupEnabled} className="h-4 w-4" /> Offer pickup at checkout
        </label>
        <div>
          <label className="label" htmlFor="pickupInstructions">Pickup instructions</label>
          <textarea id="pickupInstructions" name="pickupInstructions" rows={2} className="input" defaultValue={settings.pickupInstructions} />
        </div>
      </section>

      <section className="card grid gap-4 p-6">
        <h2 className="font-semibold text-forest">Payment methods</h2>
        <p className="text-sm text-muted">
          Only list methods you can actually accept. No online payment gateway is connected; these are shown to customers with your
          instructions and orders stay “unpaid” until you mark them paid. Clear a label to remove a method.
        </p>
        {methods.map((m, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-[1fr_auto]">
            <input type="hidden" name={`pmId${i}`} value={m.id} />
            <div>
              <label className="label" htmlFor={`pmLabel${i}`}>{m.id ? "Label" : "New method label"}</label>
              <input id={`pmLabel${i}`} name={`pmLabel${i}`} className="input" defaultValue={m.label} />
            </div>
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
              <input type="checkbox" name={`pmEnabled${i}`} defaultChecked={m.enabled} className="h-4 w-4" /> Enabled
            </label>
            <div className="sm:col-span-2">
              <label className="label" htmlFor={`pmInstructions${i}`}>Instructions shown to the customer</label>
              <textarea id={`pmInstructions${i}`} name={`pmInstructions${i}`} rows={2} className="input" defaultValue={m.instructions} />
            </div>
          </div>
        ))}
        {Object.keys(f).some((k) => k.startsWith("paymentMethods")) && <p className="field-error">Check the payment methods.</p>}
      </section>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <button className="btn-primary h-11 px-8" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
        <p role="status" aria-live="polite" className={`text-sm ${state.error ? "text-red-700" : "text-botanical"}`}>{state.error ?? state.message}</p>
      </div>
    </form>
  );
}
