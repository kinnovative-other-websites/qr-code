import type { MetadataRoute } from "next";

const BASE = "https://qrstudio.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];
}
