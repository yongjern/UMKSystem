import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-inter" });
const display = Archivo({ subsets: ["latin"], variable: "--font-display" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Yong's UMK Personal Dashboard",
  description: "UMK systems, tools, and weekly timetable in one place.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Yong's UMK System",
    description: "UMK systems, tools, and weekly timetable in one place.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff3b57",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className={`${archivo.variable} ${display.variable} ${plexMono.variable} ${newsreader.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}