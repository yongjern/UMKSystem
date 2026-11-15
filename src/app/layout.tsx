import type { Metadata, Viewport } from "next";
import { EB_Garamond, IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

import maintenance from "@/app/maintenance_update.json";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});
const editorial = EB_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: `𝐌𝐲𝐔𝐌𝐊 ♦︎ ${maintenance.statusLabel}`,
  description: maintenance.message,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  robots: { index: false, follow: false },
  openGraph: {
    title: `𝐌𝐲𝐔𝐌𝐊 ♦︎ ${maintenance.statusLabel}`,
    description: maintenance.message,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-type="software" data-radius="sharp" data-buttons="arrow" data-motion="on">
      <body className={`${inter.variable} ${display.variable} ${plexMono.variable} ${editorial.variable}`}>
        {children}
      </body>
    </html>
  );
}
