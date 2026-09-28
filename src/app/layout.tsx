import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });
const garamond = EB_Garamond({ subsets: ["latin"], style: ["italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "UMK Personal Dashboard",
  description: "UMK systems, tools, and weekly timetable in one place.",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "UMK Personal Dashboard",
    description: "UMK systems, tools, and weekly timetable in one place.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable} ${garamond.variable}`}>
        {children}
      </body>
    </html>
  );
}