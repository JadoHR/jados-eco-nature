import { Breadcrumbs } from "./breadcrumbs";

export function ContentPage({
  title,
  eyebrow,
  intro,
  legalReview = false,
  children,
}: {
  title: string;
  eyebrow?: string;
  intro?: React.ReactNode;
  legalReview?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
      <h1 className="heading-display mt-3 text-4xl sm:text-5xl">{title}</h1>
      {intro && <div className="mt-4 text-lg leading-relaxed text-ink/85">{intro}</div>}
      {legalReview && (
        <div className="mt-6 rounded-2xl border border-dashed border-[#b07a1a] bg-gold/10 p-4 text-sm" role="note">
          <strong>Template — requires legal review before launch.</strong> This text is a starting point only and is not legal
          advice. Have it reviewed against Rwandan law (including Law N° 058/2021 on the protection of personal data and privacy, and
          consumer protection rules) before the store goes live.
        </div>
      )}
      <div className="prose-jados mt-8">{children}</div>
    </div>
  );
}
