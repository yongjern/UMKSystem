import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyUMK",
    short_name: "MyUMK",
    description: "UMK classes, deadlines, buses, and campus tools in one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ff3b57",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}