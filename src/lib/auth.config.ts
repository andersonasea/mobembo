import type { NextAuthConfig } from "next-auth";
import { canAccessAdmin } from "@/lib/admin-access";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.companyId = (user as { companyId?: string | null }).companyId ?? null;
        token.companyName = (user as { companyName?: string | null }).companyName ?? null;
        token.backendToken = (user as { backendToken?: string }).backendToken;
        token.hasImage = !!(user as { hasImage?: boolean }).hasImage;
      }
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.hasImage !== undefined) token.hasImage = session.hasImage;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        session.user.companyId = token.companyId as string | null | undefined;
        session.user.companyName = token.companyName as string | null | undefined;
        session.user.backendToken = token.backendToken as string | undefined;
        session.user.hasImage = token.hasImage as boolean | undefined;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string })?.role;
      const pathname = nextUrl.pathname;

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (!canAccessAdmin(role)) return Response.redirect(new URL("/", nextUrl));
        if (
          role === "COMPANY_ADMIN" &&
          pathname.startsWith("/admin/companies")
        ) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (pathname.startsWith("/booking") || pathname.startsWith("/profile")) {
        return isLoggedIn;
      }

      return true;
    },
  },
};
