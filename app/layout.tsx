import React from 'react';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css'; // Pastikan CSS global diimport jika diperlukan

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MatyrNetwork',
  description: '  ',
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
};

export default Layout;
