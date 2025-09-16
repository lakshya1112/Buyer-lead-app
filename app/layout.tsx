// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // 👈 IMPORT THE PROVIDER

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buyer Lead Intake",
  description: "A mini app to manage buyer leads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers> {/* 👈 WRAP CHILDREN */}
      </body>
    </html>
  );
}