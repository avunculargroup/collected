import type { Metadata, Viewport } from "next";
import { Alegreya, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-alegreya",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Collected — Daily Connection Rituals",
  description:
    "Build the habit of intentional connection with your children. Rooted in Gordon Neufeld's attachment framework.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Collected",
  },
};

export const viewport: Viewport = {
  themeColor: "#8B7355",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${alegreya.variable} ${sourceSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
