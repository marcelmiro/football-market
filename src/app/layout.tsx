import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { BottomNavigationProvider } from "@/providers/bottom-navigation-provider";
import type { LayoutProps } from "@/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Bandita Market",
  description: "Trade football player shares in a virtual market",
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BottomNavigationProvider>{children}</BottomNavigationProvider>
      </body>
    </html>
  );
}
