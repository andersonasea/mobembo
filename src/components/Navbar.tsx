"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bus, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canAccessAdmin } from "@/lib/admin-access";
import { UserAvatar } from "@/components/UserAvatar";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Mobembo</span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              {canAccessAdmin((session.user as { role: string }).role) && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600">
                <UserAvatar />
                <span className="hidden sm:inline">{session.user?.name}</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">S&apos;inscrire</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
