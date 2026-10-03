import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.SITE_URL || "https://evolt-life-partners.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Partner With EVOLT Life | The Future of Wellness",
  description:
    "Align your brand with EVOLT Life Wellness — corporate sponsorship, wellness activations, and community impact. Book a partnership discovery call in under a minute.",
  openGraph: {
    title: "Partner With EVOLT Life",
    description: "Wellness. Relationships. Impact. Book your partnership discovery call.",
    url: SITE_URL,
    siteName: "EVOLT Life Wellness",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Partner With EVOLT Life", description: "Wellness. Relationships. Impact." },
};

export const viewport: Viewport = { themeColor: "#0b0f26", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Manrope:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
