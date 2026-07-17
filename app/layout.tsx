import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProviders } from "@/components/layout/RootProviders";
import { ro } from "@/lib/i18n";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("http://localhost:3000");
}

const site = siteUrl();

export const metadata: Metadata = {
  metadataBase: site,
  title: {
    default: ro.app.title,
    template: `%s · ${ro.app.name}`,
  },
  description: ro.app.description,
  applicationName: ro.app.name,
  keywords: ro.app.keywords,
  authors: [{ name: "Cristian Capotă", url: "https://github.com/rocristoi" }],
  creator: "Cristian Capotă",
  publisher: ro.app.name,
  category: "transportation",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: ro.app.name,
  },
  openGraph: {
    title: ro.app.title,
    description: ro.app.description,
    url: site,
    siteName: ro.app.name,
    locale: "ro_RO",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: ro.app.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ro.app.title,
    description: ro.app.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: ro.app.ogAlt,
      },
    ],
  },
  other: {
    "theme-color": "#121212",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
