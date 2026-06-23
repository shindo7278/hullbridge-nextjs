import AdminNav from "@/components/AdminNav";

export const metadata = {
  title: "Admin — Hullbridge Dental Clinic",
  robots: { index: false, follow: false }, // never let admin pages get indexed
};

export default function AdminLayout({ children }) {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <AdminNav />
      {children}
    </div>
  );
}
