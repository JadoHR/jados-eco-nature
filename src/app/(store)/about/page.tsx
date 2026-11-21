import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "About JADOS",
  description: "The story, vision and values of JADOS ECO-NATURE INDUSTRIES — a Rwanda-based beekeeping and nature-inspired products venture.",
};

export default function AboutPage() {
  return (
    <ContentPage
      title="About JADOS"
      eyebrow="Our story"
      intro={
        <p>
          JADOS ECO-NATURE INDUSTRIES is a Rwanda-based venture building trusted, well-designed products from beekeeping and locally
          available botanical resources — for customers in Rwanda and, step by step, across East Africa.
        </p>
      }
    >
      <h2>Why bees?</h2>
      <p>
        Bees sit at the heart of healthy landscapes. Beekeeping gives us honey and beeswax, supports pollination of crops and wild
        plants, and can provide income for rural families. It is a natural foundation for a company that wants to create value while
        preserving life.
      </p>

      <h2>Where we are today</h2>
      <p>
        We are an early-stage business. Our first focus is a small, carefully chosen range — honey and beeswax products — while we
        develop a botanical skincare collection that will only be sold once its formulation, safety testing, labelling and any
        required approvals are complete.
      </p>
      <p>
        Over time we hope to grow into candles and fragrance, botanical oils, gift sets, and beekeeping education. We will only
        describe something as available when it truly is.
      </p>

      <h2>Vision</h2>
      <p>
        To build a respected African nature-based products company that transforms renewable local resources into high-quality
        consumer products while supporting biodiversity and local livelihoods.
      </p>

      <h2>Mission</h2>
      <p>
        To develop, manufacture, source and sell useful, attractive nature-inspired products through responsible production,
        thoughtful design, scientific product development and strong customer relationships.
      </p>

      <h2>Our values</h2>
      <ul>
        <li>Sustainability and responsible sourcing</li>
        <li>Product quality and customer safety</li>
        <li>Local empowerment and fair partnerships</li>
        <li>Innovation and continuous improvement</li>
        <li>Transparency and honest product claims</li>
        <li>Resource efficiency and waste reduction</li>
      </ul>

      <h2>Founder</h2>
      <p>
        JADOS was founded by Jean de Dieu Habumuremyi with the ambition of connecting Rwandan beekeeping and botanical resources with
        modern product development and design.
      </p>

      <h2>Our sourcing story</h2>
      <p>
        Each product page will state where its honey or wax comes from — whether from JADOS hives or from partner beekeepers — as soon
        as those details are confirmed. Read more about our approach on the{" "}
        <Link href="/our-impact" className="underline">
          sustainability &amp; community
        </Link>{" "}
        page.
      </p>
    </ContentPage>
  );
}
