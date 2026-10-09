import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NORTH — An atlas of everyday life",
  description: "Explore the geography and everyday life of North Korea through documented sources and clearly labeled AI reconstructions, 2015–2019.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
