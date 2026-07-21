import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { auth } from "@/lib/auth";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers session={session}>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center text-sm text-gray-500 sm:flex-row sm:justify-between sm:text-left">
              <p>&copy; {new Date().getFullYear()} Mobembo. Tous droits réservés.</p>
              <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <Link href="/confidentialite" className="hover:text-orange-600 hover:underline">
                  Confidentialité
                </Link>
                <Link href="/bientot" className="hover:text-orange-600 hover:underline">
                  Pré-lancement
                </Link>
                <Link href="/partenaires" className="hover:text-orange-600 hover:underline">
                  Partenaires
                </Link>
              </nav>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
