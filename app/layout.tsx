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
    default: 'Cerbero AI – AI + DeFi Autotrading Ecosystem',
    template: '%s | Cerbero AI',
  },
  description: 'Cerbero AI – AI + DeFi autotrading ecosystem.',
  metadataBase: new URL('https://cerberoai.com'),
  themeColor: '#000000',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Cerbero AI – AI + DeFi Autotrading Ecosystem',
    description: 'Cerbero AI – AI + DeFi autotrading ecosystem.',
    url: 'https://cerberoai.com',
    siteName: 'Cerbero AI',
    type: 'website',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Cerbero AI Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cerbero AI – AI + DeFi Autotrading Ecosystem',
    description: 'Cerbero AI – AI + DeFi autotrading ecosystem.',
    images: ['/icon-512.png'],
  },
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
