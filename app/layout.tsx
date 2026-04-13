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
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">

        {/* Konten Halaman Utama */}
        {children}

        {/* ToastProvider dipanggil sebagai komponen yang sejajar (sibling).
          Ia tidak memerlukan 'children' karena hanya bertugas menyuntikkan 
          logika notifikasi global ke dalam DOM aplikasi.
        */}
        <ToastProvider />

      </body>
    </html>
  );
} 