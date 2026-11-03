import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  // Absolute URLs for canonical, hreflang and Open Graph images.
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | PE-LINE",
    default: "PE-LINE | Pametna rješenja za grijanje i hlađenje",
  },
  description:
    "PE-LINE je distributer HVAC i kupaonskih proizvoda s 32 godine iskustva u struci.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" suppressHydrationWarning>
      <body className="min-h-dvh flex flex-col antialiased bg-bg text-ink" suppressHydrationWarning>{children}</body>
    </html>
  );
}
