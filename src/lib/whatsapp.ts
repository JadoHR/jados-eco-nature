/** Normalise a configured phone number to digits only (wa.me format, international, no +). */
export function whatsappDigits(number: string): string {
  return number.replace(/[^\d]/g, "");
}

/** Returns a wa.me link, or null when no valid number is configured (never invent one). */
export function whatsappLink(number: string, message?: string): string | null {
  const digits = whatsappDigits(number);
  if (digits.length < 8) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}
