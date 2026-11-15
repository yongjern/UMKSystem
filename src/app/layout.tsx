import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import maintenance from "@/app/maintenance.json";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-sans" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
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
  themeColor: "#f2f0e9",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-type="software" data-radius="sharp" data-buttons="arrow" data-motion="on">
      <body className={`${archivo.variable} ${plexMono.variable}`}>{children}</body>
    </html>
  );
}
