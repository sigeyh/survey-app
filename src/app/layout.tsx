import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Survey Pro — Earn from Surveys in Kenya",
  description:
    "Kenya's #1 survey platform. Complete high-value tasks, earn real money, and withdraw instantly via M-Pesa.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-512.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Survey Pro",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFD700",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>

        {/* PayHero SDK */}
        <Script
          src="https://applet.payherokenya.com/cdn/button_sdk.js?v=3.1"
          strategy="lazyOnload"
        />

        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(reg) { console.log('SW registered:', reg.scope); })
                  .catch(function(err) { console.log('SW registration failed:', err); });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
