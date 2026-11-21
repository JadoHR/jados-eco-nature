import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy policy" eyebrow="Policies" legalReview>
      <p><em>Last updated: [date to be set at launch]</em></p>

      <h2>Who we are</h2>
      <p>JADOS ECO-NATURE INDUSTRIES (“JADOS”, “we”) operates this website. [Insert registered business name, registration number and
        contact address once confirmed.]</p>

      <h2>What we collect and why</h2>
      <ul>
        <li><strong>Orders:</strong> your name, phone number, optional email, delivery address, city/district and notes — used only to
          confirm, prepare, deliver and support your order, and to keep business and tax records.</li>
        <li><strong>Contact form:</strong> your name, contact details and message — used to reply to you.</li>
        <li><strong>Newsletter (optional):</strong> your email address and the date you gave consent — used to send occasional
          updates. You can withdraw consent at any time.</li>
        <li><strong>Your cart:</strong> stored only in your own browser (local storage) so it survives a page refresh. It is not
          sent to us until you check out.</li>
      </ul>
      <p>We do not collect card numbers or online payment details on this website.</p>

      <h2>Cookies and analytics</h2>
      <p>This website uses one strictly necessary cookie for administrator sign-in and browser storage for your cart and theme
        preference. No advertising or analytics cookies are used. [If analytics is added later, describe it here and ask for consent
        first.]</p>

      <h2>Who we share data with</h2>
      <p>We share delivery details only with the people or delivery partners who fulfil your order. We do not sell personal data.
        [List hosting and other service providers once chosen.]</p>

      <h2>How long we keep data</h2>
      <p>[To be completed] Order records are kept for as long as required for accounting and legal purposes. Contact messages and
        newsletter data are deleted when no longer needed or when you ask us to.</p>

      <h2>Your rights</h2>
      <p>You may ask to access, correct or delete your personal data, or object to its use, by contacting us. [Describe how to
        contact the person responsible for data protection.]</p>
    </ContentPage>
  );
}
