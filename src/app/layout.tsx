"use client";
import React, { useEffect } from "react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next"; // Install jika belum: npm install cookies-next
import "./globals.css"; // Pastikan CSS global diimport jika diperlukan

const inter = Inter({ subsets: ["latin"] });

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("token");
    console.log("Checking auth in layout.tsx:", token);

    if (token && (window.location.pathname === "/login" || window.location.pathname === "/register")) {
      console.log("User is logged in, redirecting to /dashboard");
      router.push("/dashboard");
    }
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
};

export default Layout;
