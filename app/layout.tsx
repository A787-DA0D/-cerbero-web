import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import AuthProvider from "@/components/auth/AuthProvider";

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
    default: "Cerbero AI",
    template: "%s | Cerbero AI",
  },
  description: "Cerbero AI – AI autotrading platform (CeFi).",
  metadataBase: new URL("https://cerberoai.com"),
  themeColor: "#000000",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Cerbero AI",
    description: "Cerbero AI – AI autotrading platform (CeFi).",
    url: "https://cerberoai.com",
    siteName: "Cerbero AI",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Cerbero AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cerbero AI",
    description: "Cerbero AI – AI autotrading platform (CeFi).",
    images: ["/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
<head>
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
</head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          {children}
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
