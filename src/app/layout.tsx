import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | PE-LINE",
    default: "PE-LINE — Pametna rješenja za grijanje, hlađenje i sanitarije",
  },
  description:
    "PE-LINE je distributer HVAC i kupaonskih proizvoda s 32 godine iskustva. Petrokov d.o.o.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased bg-bg text-ink" suppressHydrationWarning>{children}</body>
    </html>
  );
}
