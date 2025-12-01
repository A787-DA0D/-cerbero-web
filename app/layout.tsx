import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cerbero AI — Switch On. Sit Back. Relax.",
    template: "%s — Cerbero AI",
  },
  description:
    "Cerbero AI è una piattaforma di Wealth Management su blockchain: attivi l’Autopilot e la Coscienza AI gestisce i mercati al posto tuo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050816] text-white`}
      >
        <div className="min-h-screen">
          {children}
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
