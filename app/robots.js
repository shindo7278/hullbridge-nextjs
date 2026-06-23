import { MetadataRoute } from "next";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin/" },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.hullbridgedentalclinic.co.uk"}/sitemap.xml`,
  };
}
