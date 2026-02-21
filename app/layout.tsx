import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import AuthProvider from "@/components/auth/AuthProvider";
import RouteChangeTracker from "@/components/analytics/RouteChangeTracker";

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

        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                const gaDebug =
                  window.location.hostname === 'localhost' ||
                  new URLSearchParams(window.location.search).has('ga_debug');

                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  send_page_view: false,
                  debug_mode: gaDebug
                });
              `}
            </Script>
          </>
        ) : null}
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <RouteChangeTracker />
          {children}
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
