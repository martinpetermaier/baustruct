import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BauGPT Procurement — Digitales Bestellwesen für Bau",
  description:
    "Procure-to-Pay für die Bauindustrie: Bestellung, Lieferschein, KI-Rechnungsprüfung, 3-Way-Match.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
