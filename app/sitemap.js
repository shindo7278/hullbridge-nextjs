const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hullbridgedentalclinic.co.uk";

export default function sitemap() {
  const staticPages = ["", "/services", "/our-prices", "/blog", "/contact", "/book"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  // In production, also map over published Service and BlogPost
  // records here so every individual page gets indexed too.
  return staticPages;
}
