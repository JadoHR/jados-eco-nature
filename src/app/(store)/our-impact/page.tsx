import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Sustainability & community",
  description: "How JADOS ECO-NATURE INDUSTRIES approaches beekeeping, sourcing, packaging and community partnerships.",
};

export default function ImpactPage() {
  return (
    <ContentPage
      title="Sustainability & community"
      eyebrow="Our approach"
      intro={
        <p>
          These are the principles we intend to build JADOS on. We are a young company, so this page describes commitments and plans —
          not achievements. We will update it with real, verifiable progress as it happens.
        </p>
      }
    >
      <h2>Beekeeping as a foundation</h2>
      <p>
        Our plan is to grow beekeeping gradually — as market demand, land, colony health, trained people and operating cash allow — with
        honey, beeswax and, later, propolis as the main outputs. Healthy colonies come before volume.
      </p>
      <ul>
        <li>Honey for retail and, where suitable, for product formulations.</li>
        <li>Beeswax for candles and lip-care products.</li>
        <li>Propolis as a potential ingredient — subject to research, safety review and compliance.</li>
        <li>Beekeeping education and visits as a future activity, once operations are ready.</li>
      </ul>

      <h2>Responsible sourcing</h2>
      <p>
        We want to know where every ingredient comes from. When we work with partner beekeepers or growers in Rwanda and the wider East
        African region, we aim for fair, long-term relationships and clear quality standards on both sides.
      </p>

      <h2>Honest products</h2>
      <p>
        We do not make medical claims, we do not use “chemical-free” slogans, and we will not describe a product as organic, certified
        or tested unless we hold the documentation to prove it.
      </p>

      <h2>Packaging and waste</h2>
      <p>
        We will prefer reusable glass and recyclable or compostable materials where practical, and look for ways to use by-products —
        for example, beeswax from honey harvesting — instead of discarding them.
      </p>

      <h2>Community</h2>
      <p>
        As we grow, we hope to create local jobs, share beekeeping knowledge and support pollinator-friendly practices. When we have
        real numbers to report, we will publish them here.
      </p>
    </ContentPage>
  );
}
