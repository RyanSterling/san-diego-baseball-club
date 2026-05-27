import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "San Diego Baseball Club",
  description: "San Diego Baseball Club - Schedule, Roster, Stats & More",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-body bg-cream text-dark">{children}</body>
    </html>
  );
}
