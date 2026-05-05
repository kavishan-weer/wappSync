import type { Metadata } from "next";
import { Schibsted_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const fontHeading = Schibsted_Grotesk({
  variable: "--font-heading-family",
  subsets: ["latin"],
});

const fontSans = DM_Sans({
  variable: "--font-sans-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "wappSync",
  description: "Next.js application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontHeading.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
