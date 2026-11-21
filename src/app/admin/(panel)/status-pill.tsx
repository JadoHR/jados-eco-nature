const COLORS: Record<string, string> = {
  pending_confirmation: "bg-gold/25 text-[#7a5a0c] dark:text-gold",
  confirmed: "bg-sage/25 text-botanical",
  processing: "bg-sage/25 text-botanical",
  ready_for_dispatch: "bg-forest/15 text-forest",
  dispatched: "bg-forest/15 text-forest",
  delivered: "bg-forest text-on-forest",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  refunded: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  unpaid: "bg-gold/25 text-[#7a5a0c] dark:text-gold",
  paid: "bg-forest text-on-forest",
  published: "bg-forest/15 text-forest",
  draft: "bg-line text-muted",
  archived: "bg-line text-muted",
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLORS[status] ?? "bg-line text-muted"}`}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
