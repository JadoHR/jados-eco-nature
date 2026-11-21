"use client";

import Link from "next/link";
import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; message?: string }>({ status: "idle" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      setState({ status: "error", message: "Please tick the consent box." });
      return;
    }
    setState({ status: "loading" });
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setState({ status: "done", message: "Thank you — you are on the list." });
      setEmail("");
      setConsent(false);
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Something went wrong" });
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="nl-email" className="sr-only">
          Email address
        </label>
        <input id="nl-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input h-12 flex-1 rounded-full px-5" />
        <button type="submit" className="btn-primary h-12 px-7" disabled={state.status === "loading"}>
          {state.status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="flex items-start gap-2 text-sm text-muted">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--forest)]" />
        <span>
          I agree to receive occasional emails from JADOS. See our{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>
          .
        </span>
      </label>
      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${state.status === "error" ? "text-red-700 dark:text-red-300" : "text-botanical"}`}>
        {state.message}
      </p>
    </form>
  );
}
