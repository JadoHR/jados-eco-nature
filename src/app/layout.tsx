import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "JADOS ECO-NATURE INDUSTRIES — Nature. Science. Rwanda.",
    template: "%s · JADOS ECO-NATURE",
  },
  description:
    "Nature-inspired products from Rwanda: honey, beeswax candles and a botanical skincare collection in development. From Nature to Innovation — Creating Value, Preserving Life.",
  openGraph: {
    type: "website",
    siteName: "JADOS ECO-NATURE INDUSTRIES",
    title: "JADOS ECO-NATURE INDUSTRIES",
    description: "From Nature to Innovation — Creating Value, Preserving Life.",
    images: [{ url: "/brand/jados-mark.svg", width: 120, height: 120, alt: "JADOS bee, flower and leaf mark" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#174D36" },
    { media: "(prefers-color-scheme: dark)", color: "#101612" },
  ],
};

// Applies the saved/system theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('jados-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-paper text-ink">{children}</body>
    </html>
  );
}
