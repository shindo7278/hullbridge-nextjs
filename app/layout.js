import "./globals.css";

export const metadata = {
  title: "Hullbridge Dental Clinic — Dentist in Hullbridge, Essex",
  description:
    "Independent dental surgery on Ferry Road, Hullbridge. Preventative, restorative and cosmetic dentistry for the whole family.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
