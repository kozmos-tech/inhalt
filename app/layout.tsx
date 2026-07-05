import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Match the landing page: Fraunces for headings, Geist Sans for body/UI,
// Geist Mono for code. Each is exposed as a CSS variable so globals.css can
// pick the right family per element.
const heading = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Inhalt",
  description: "The CMS your AI tools can run.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        {children}
        <script defer src="https://yourtraffic.dev/script.js"></script>
      </body>
    </html>
  );
}
