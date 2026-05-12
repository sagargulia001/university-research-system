import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}
export const metadata: Metadata = {
  title: "University Research Portal",
  description: "Access and manage academic research",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
