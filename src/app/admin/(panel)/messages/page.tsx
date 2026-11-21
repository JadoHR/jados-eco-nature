import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteSubscriberAction, toggleMessageHandledAction } from "../../actions";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireAdmin();
  const [messages, subscribers] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: [{ handled: "asc" }, { createdAt: "desc" }], take: 200 }),
    prisma.newsletterSubscriber.findMany({ orderBy: { consentAt: "desc" } }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-3xl text-forest">Contact messages</h1>
        {messages.length === 0 ? (
          <p className="mt-4 text-muted">No messages yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {messages.map((m) => (
              <li key={m.id} className={`card p-5 ${m.handled ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {m.name} <span className="font-normal text-muted">· {m.contact}</span>
                  </p>
                  <span className="text-xs text-muted">
                    {m.topic} · {m.createdAt.toLocaleString("en-GB")}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>
                <form action={toggleMessageHandledAction} className="mt-3">
                  <input type="hidden" name="id" value={m.id} />
                  <button className="rounded-full border border-line px-3 py-1 text-xs hover:border-forest">
                    {m.handled ? "Mark as not handled" : "Mark as handled"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl text-forest">Newsletter subscribers ({subscribers.length})</h2>
        <p className="mt-1 text-sm text-muted">Each subscriber ticked a consent box. Remove anyone who asks to unsubscribe.</p>
        {subscribers.length > 0 && (
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-cream text-sm">
            {subscribers.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 p-3">
                <span>{s.email}</span>
                <span className="text-xs text-muted">consent {s.consentAt.toLocaleDateString("en-GB")}</span>
                <form action={deleteSubscriberAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-xs text-red-700 underline">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
