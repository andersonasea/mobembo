import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mobembo - Réservation de Bus",
  description:
    "Réservez votre billet de bus en ligne. Choisissez votre société de transport, destination et horaire en quelques clics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-8">
            <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Mobembo. Tous droits réservés.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
