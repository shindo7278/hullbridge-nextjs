"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Prices & Services", href: "/admin/pricing" },
  { label: "Blog", href: "/admin/blog" },
  { label: "FAQs", href: "/admin/faq" },
  { label: "Opening Hours", href: "/admin/opening-hours" },
  { label: "Homepage Video", href: "/admin/homepage" },
  { label: "Messages", href: "/admin/messages" },
];

export default function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #E3EEF5", padding: "0 24px", overflowX: "auto" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 4 }}>
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} style={{
            padding: "14px 14px", textDecoration: "none", fontSize: 13.5, fontWeight: 700,
            color: pathname === tab.href ? "#2F7FB3" : "#7C93A6",
            borderBottom: pathname === tab.href ? "2px solid #2F7FB3" : "2px solid transparent",
            whiteSpace: "nowrap",
          }}>
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
