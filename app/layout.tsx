import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { ClerkProvider } from "@clerk/nextjs";
// import { ClerkAuthSync } from '@/app/_components/clerkAuthSync'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Testmate Pro",
  description: "A Testing Platform for Trainers and Trainees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* <ClerkAuthSync/> */}
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
        <Toaster />
      </body>
    </html>
    </ClerkProvider>
  );
}
