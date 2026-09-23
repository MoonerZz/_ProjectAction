import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: brand.name,
    short_name: brand.name,
    description: brand.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: brand.background,
    theme_color: brand.theme,
    lang: "en-GB",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
