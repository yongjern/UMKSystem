import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyUMK Maintenance",
    short_name: "MyUMK",
    description: "Current MyUMK maintenance status.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f0e9",
    theme_color: "#f2f0e9",
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