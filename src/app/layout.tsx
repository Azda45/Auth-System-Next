"use client";
import React, { useEffect } from "react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import "./globals.css"; // Pastikan CSS global diimport jika diperlukan

const inter = Inter({ subsets: ["latin"] });

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
};

export default Layout;
