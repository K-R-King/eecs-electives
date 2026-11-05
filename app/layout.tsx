import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import SuiteLinks from "@/components/SuiteLinks";
import { siteUrl } from "@/lib/suite";
import "./globals.css";

const SITE_URL = siteUrl("electives");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "UC Berkeley EECS Electives",
  description: "Find the upper-division EECS electives that fit your interests, goals, and the classes you have taken.",
  openGraph: {
    title: "UC Berkeley EECS Electives",
    description: "Find the upper-division EECS electives that fit your interests, goals, and the classes you have taken.",
    url: "/",
    siteName: "EECS Hub",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

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
        {children}
        <SuiteLinks />
        <Analytics />
      </body>
    </html>
  );
}
