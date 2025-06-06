import type { Metadata } from "next";
import { Noto_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";

// Load the fonts with CSS variable names
const notoSansThaiUI = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai-ui",
  subsets: ["latin", "thai"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "More Than an Assistant — A Strategic Partner.",
  description: "Making Your Vision Smoother, Smarter, and Stress-Free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSansThaiUI.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
