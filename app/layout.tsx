import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dev Reality Dashboard",
  description: "A developer analytics platform tracking productivity, coding patterns, and mood",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
