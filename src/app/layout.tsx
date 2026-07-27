import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { ServiceWorker } from "@/components/service-worker";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3016";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fokus — Projekt-Cockpit",
    template: "%s · Fokus",
  },
  description:
    "Alle Projekte auf einen Blick: Status, Fortschritt, Deadlines und die eine Aufgabe, die als Nächstes zählt.",
  applicationName: "Fokus",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Fokus",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Fokus — Projekt-Cockpit",
    description: "Projekte im Überblick halten, ohne sich zu verzetteln.",
    url: siteUrl,
    siteName: "Fokus",
    locale: "de_DE",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#2b2c30",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
