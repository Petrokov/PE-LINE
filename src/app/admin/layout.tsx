import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Admin PE-LINE", default: "Admin | PE-LINE" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg-secondary">{children}</div>;
}
