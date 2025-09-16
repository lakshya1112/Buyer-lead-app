// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

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
      {/* 👇 Added a subtle background color to the whole app */}
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}