/**
 * Central configuration for the public Transline Classic website.
 * Values can be overridden with environment variables (no hardcoding in components).
 */
const env = import.meta.env as Record<string, string | undefined>;

export const siteConfig = {
  name: "Transline Classic",
  tagline: "Travel with Transline Classic",
  /** WhatsApp business number in international format, digits only. */
  whatsappNumber: env["VITE_WHATSAPP_NUMBER"] ?? "254720000111",
  supportPhone: env["VITE_SUPPORT_PHONE"] ?? "+254 720 000 111",
  supportEmail: env["VITE_SUPPORT_EMAIL"] ?? "info@translineclassic.co.ke",
  /** URL of the existing staff / admin portal. */
  staffPortalUrl: env["VITE_STAFF_PORTAL_URL"] ?? "https://transline-classic.lovable.app/auth",
  headOffice: "Accra Road, Nairobi CBD, Kenya",
} as const;

export function whatsappLink(message: string): string {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function formatKes(amount: number | string | null | undefined): string {
  const value = Number(amount ?? 0);
  return `KES ${value.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}
