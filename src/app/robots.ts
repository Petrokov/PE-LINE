import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin and the visitor's own inquiry list have nothing to index.
      disallow: ["/admin", "/hr/upit", "/sl/upit", "/en/upit"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
