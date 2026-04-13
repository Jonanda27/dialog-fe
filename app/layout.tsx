// File: dialog-fe/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Analog.id | Marketplace Analog Photography",
  description: "Platform jual beli kamera dan film analog terpercaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id" // Menggunakan bahasa Indonesia
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning // Mencegah peringatan perbedaan state saat menggunakan localStorage
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <ToastProvider>
          {/* RootLayout bertindak sebagai pembungkus utama. 
              Semua halaman di dalamnya akan memiliki akses ke sistem Toast.
              Logika fetchMe (inisialisasi user) sebaiknya diletakkan di dalam 
              layout rute masing-masing (Buyer/Seller) via Client Component.
          */}
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}