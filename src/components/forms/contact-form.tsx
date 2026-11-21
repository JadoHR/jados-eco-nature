"use client";

import { useState } from "react";
import { contactSchema, fieldErrors } from "@/lib/validation";

const empty = { name: "", contact: "", topic: "general" as "general" | "order" | "wholesale" | "partnership", message: "" };

export function ContactForm() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    const parsed = contactSchema.safeParse({ ...form, website });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error();
      }
      setStatus("sent");
      setForm(empty);
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-6 rounded-2xl bg-forest/10 p-6" role="status">
        <h3 className="font-semibold text-forest">Thank you — your message has been sent.</h3>
        <p className="mt-1 text-sm text-muted">We will reply as soon as we can.</p>
        <button type="button" className="btn-secondary mt-4" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  const err = (k: string) => errors[k] && <p id={`ce-${k}`} className="field-error">{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">Name *</label>
          <input id="c-name" className="input" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={Boolean(errors.name) || undefined} aria-describedby={errors.name ? "ce-name" : undefined} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="c-contact" className="label">Email or phone *</label>
          <input id="c-contact" className="input" autoComplete="email" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} aria-invalid={Boolean(errors.contact) || undefined} aria-describedby={errors.contact ? "ce-contact" : undefined} />
          {err("contact")}
        </div>
      </div>
      <div>
        <label htmlFor="c-topic" className="label">Topic</label>
        <select id="c-topic" className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value as typeof form.topic })}>
          <option value="general">General question</option>
          <option value="order">An existing order</option>
          <option value="wholesale">Wholesale / hotels / corporate gifts</option>
          <option value="partnership">Beekeeper or supplier partnership</option>
        </select>
      </div>
      <div>
        <label htmlFor="c-message" className="label">Message *</label>
        <textarea id="c-message" rows={5} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={Boolean(errors.message) || undefined} aria-describedby={errors.message ? "ce-message" : undefined} maxLength={2000} />
        {err("message")}
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <p className="text-xs text-muted">We only use these details to reply to your message.</p>
      {status === "error" && <p className="text-sm text-red-700" role="alert">We could not send your message. Please try again.</p>}
      <button type="submit" className="btn-primary h-11 px-7" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
